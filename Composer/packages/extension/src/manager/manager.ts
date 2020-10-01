// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import glob from 'globby';
import { readJson, ensureDir } from 'fs-extra';

import { ExtensionContext } from '../extensionContext';
import logger from '../logger';
import { ExtensionManifestStore } from '../storage/extensionManifestStore';
import { ExtensionBundle, PackageJSON, ExtensionMetadata, ExtensionSearchResult } from '../types/extension';
import { npm, downloadPackage } from '../utils/npm';

const log = logger.extend('manager');

const SEARCH_CACHE_TIMEOUT = 5 * 60000; // 5 minutes

function processBundles(extensionPath: string, bundles: ExtensionBundle[]) {
  return bundles.map((b) => ({
    ...b,
    path: path.resolve(extensionPath, b.path),
  }));
}

function getExtensionMetadata(extensionPath: string, packageJson: PackageJSON): ExtensionMetadata {
  return {
    id: packageJson.name,
    name: packageJson.composer?.name ?? packageJson.name,
    description: packageJson.description,
    version: packageJson.version,
    enabled: true,
    path: extensionPath,
    bundles: processBundles(extensionPath, packageJson.composer?.bundles ?? []),
    contributes: packageJson.composer?.contributes ?? {},
  };
}

class ExtensionManager {
  private searchCache = new Map<string, ExtensionSearchResult>();
  private _manifest: ExtensionManifestStore | undefined;
  private _lastSearchTimestamp: Date | undefined;

  /**
   * Returns all extensions currently in the extension manifest
   */
  public getAll(): ExtensionMetadata[] {
    const extensions = this.manifest.getExtensions();
    return Object.values(extensions).filter(Boolean) as ExtensionMetadata[];
  }

  /**
   * Returns the extension manifest entry for the specified extension ID
   * @param id Id of the extension to search for
   */
  public find(id: string) {
    return this.manifest.getExtensionConfig(id);
  }

  /**
   * Loads all builtin extensions and remote extensions.
   */
  public async loadAll() {
    await ensureDir(this.remoteDir);

    await this.loadFromDir(this.builtinDir);
    await this.loadFromDir(this.remoteDir);
  }

  /**
   * Loads extensions from a given directory
   * @param dir directory to load extensions from
   * @param isBuiltin used to set extension metadata
   */
  public async loadFromDir(dir: string, isBuiltin = false) {
    log('Loading extensions from %s', dir);
    const extensions = await glob('*/package.json', { cwd: dir });
    for (const extensionPackageJsonPath of extensions) {
      const fullPath = path.join(dir, extensionPackageJsonPath);
      const extensionInstallPath = path.dirname(fullPath);
      const packageJson = (await readJson(fullPath)) as PackageJSON;
      const isEnabled = packageJson?.composer && packageJson.composer.enabled !== false;
      const metadata = getExtensionMetadata(extensionInstallPath, packageJson);
      if (packageJson && (isEnabled || packageJson.extendsComposer === true)) {
        this.manifest.updateExtensionConfig(metadata.id, {
          ...metadata,
          builtIn: isBuiltin,
        });
        await this.load(metadata.id);
      } else if (this.manifest.getExtensionConfig(metadata.id)) {
        // remove the extension if it exists in the manifest
        this.manifest.removeExtension(metadata.id);
      }
    }
  }

  /**
   * Installs a remote extension via NPM
   * @param name The name of the extension to install
   * @param version The version of the extension to install
   * @returns id of installed package
   */
  public async installRemote(name: string, version?: string) {
    await ensureDir(this.remoteDir);
    const packageNameAndVersion = version ? `${name}@${version}` : `${name}@latest`;
    log('Installing %s to %s', packageNameAndVersion, this.remoteDir);

    try {
      const destination = path.join(this.remoteDir, name);
      await downloadPackage(name, version ?? 'latest', destination);

      const packageJson = await this.getPackageJson(name, this.remoteDir);
      if (packageJson) {
        this.manifest.updateExtensionConfig(packageJson.name, getExtensionMetadata(destination, packageJson));
      }

      return name;
    } catch (err) {
      log('%s', err.message ?? err);
      throw new Error(`Unable to install ${packageNameAndVersion}`);
    }
  }

  public async load(id: string) {
    const metadata = this.manifest.getExtensionConfig(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, security/detect-non-literal-require
      const extension = metadata?.path && require(metadata.path);

      if (!extension) {
        throw new Error(`Extension not found: ${id}`);
      }

      await ExtensionContext.loadPlugin(id, '', extension);
    } catch (err) {
      log('Unable to load extension `%s`', id);
      log('%O', err);
      if (!metadata?.builtIn) {
        await this.remove(id);
      }
      throw err;
    }
  }

  /**
   * Enables an extension
   * @param id Id of the extension to be enabled
   */
  public async enable(id: string) {
    this.manifest.updateExtensionConfig(id, { enabled: true });

    await this.load(id);
  }

  /**
   * Disables an extension
   * @param id Id of the extension to be disabled
   */
  public async disable(id: string) {
    this.manifest.updateExtensionConfig(id, { enabled: false });

    // TODO: tear down extension?
  }

  /**
   * Removes a remote extension via NPM
   * @param id Id of the extension to be removed
   */
  public async remove(id: string) {
    log('Removing %s', id);

    try {
      const { stdout } = await npm('uninstall', id, { '--prefix': this.remoteDir }, { cwd: this.remoteDir });

      log('%s', stdout);

      this.manifest.removeExtension(id);
    } catch (err) {
      log('%s', err);
      throw new Error(`Unable to remove extension: ${id}`);
    }
  }

  /**
   * Searches for an extension via NPM's search function
   * @param query The search query
   */
  public async search(query: string) {
    await this.updateSearchCache();
    const normalizedQuery = query.toLowerCase();

    const results = Array.from(this.searchCache.values()).filter((result) => {
      return (
        !this.find(result.id) &&
        [result.id, result.description, ...result.keywords].some((target) =>
          target.toLowerCase().includes(normalizedQuery)
        )
      );
    });

    return results;
  }

  /**
   * Returns a list of all of an extension's bundles
   * @param id The ID of the extension for which we will fetch the list of bundles
   */
  public async getAllBundles(id: string) {
    const info = this.find(id);

    if (!info) {
      throw new Error('extension not found');
    }

    return info.bundles ?? [];
  }

  /**
   * Returns a specific bundle for an extension
   * @param id The id of the desired extension
   * @param bundleId The id of the desired extension's bundle
   */
  public getBundle(id: string, bundleId: string): string | null {
    const info = this.find(id);

    if (!info) {
      throw new Error('extension not found');
    }

    const bundle = info.bundles.find((b) => b.id === bundleId);

    if (!bundle) {
      throw new Error('bundle not found');
    }

    return bundle.path;
  }

  private async getPackageJson(id: string, dir: string): Promise<PackageJSON | undefined> {
    try {
      const extensionPackagePath = path.resolve(dir, id, 'package.json');
      log('fetching package.json for %s at %s', id, extensionPackagePath);
      const packageJson = await readJson(extensionPackagePath);
      return packageJson as PackageJSON;
    } catch (err) {
      log('Error getting package json for %s', id);
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  public reloadManifest() {
    this._manifest = undefined;
  }

  private get manifest() {
    if (this._manifest) {
      return this._manifest;
    }

    this._manifest = new ExtensionManifestStore(process.env.COMPOSER_EXTENSION_DATA as string);
    return this._manifest;
  }

  private get builtinDir() {
    if (!process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR) {
      throw new Error('COMPOSER_BUILTIN_EXTENSIONS_DIR must be set.');
    }

    return process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR;
  }

  private get remoteDir() {
    if (!process.env.COMPOSER_REMOTE_EXTENSIONS_DIR) {
      throw new Error('COMPOSER_REMOTE_EXTENSIONS_DIR must be set.');
    }

    return process.env.COMPOSER_REMOTE_EXTENSIONS_DIR;
  }

  private async updateSearchCache() {
    const timeout = new Date(new Date().getTime() - SEARCH_CACHE_TIMEOUT);
    if (!this._lastSearchTimestamp || this._lastSearchTimestamp < timeout) {
      const { stdout } = await npm('search', '', {
        '--json': '',
        '--searchopts': '"keywords:botframework-composer extension"',
      });

      try {
        const result = JSON.parse(stdout);
        if (Array.isArray(result)) {
          result.forEach((searchResult) => {
            const { name, keywords = [], version, description, links } = searchResult;
            if (keywords.includes('botframework-composer') && keywords.includes('extension')) {
              const url = links?.npm ?? '';
              this.searchCache.set(name, {
                id: name,
                version,
                description,
                keywords,
                url,
              });
            }
          });
        }
      } catch (err) {
        log('%O', err);
      }
    }
  }
}

const manager = new ExtensionManager();

export { manager as ExtensionManager };
