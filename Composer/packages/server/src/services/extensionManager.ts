// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import glob from 'globby';
import { readJson, ensureDir, remove, pathExists } from 'fs-extra';
import {
  ExtensionBundle,
  PackageJSON,
  ExtensionMetadata,
  ExtensionConfigurationSchema,
  JSONSchema7,
  ExtensionSettings,
} from '@botframework-composer/types';
import { ExtensionRegistration } from '@bfc/extension';
import mapKeys from 'lodash/mapKeys';

import settings from '../settings';
import logger from '../logger';
import { JsonStore } from '../store/store';
import { search, downloadPackage } from '../utility/npm';
import { isSubdirectory } from '../utility/isSubdirectory';
import { ExtensionContext } from '../models/extension/extensionContext';

const log = logger.extend('extension-manager');

function processBundles(extensionPath: string, bundles: ExtensionBundle[]) {
  return bundles.map((b) => ({
    ...b,
    path: path.resolve(extensionPath, b.path),
  }));
}

function extractMetadata(extensionPath: string, packageJson: PackageJSON): ExtensionMetadata {
  return {
    id: packageJson.name,
    name: packageJson.composer?.name ?? packageJson.name,
    description: packageJson.description,
    version: packageJson.version,
    enabled: true,
    path: extensionPath,
    bundles: processBundles(extensionPath, packageJson.composer?.bundles ?? []),
    contributes: packageJson.composer?.contributes ?? {},
    configurationSchema: packageJson.composer?.configuration,
  };
}

export type ExtensionManifest = Record<string, ExtensionMetadata>;

export class ExtensionManagerImp {
  public constructor(
    private _manifest?: JsonStore<ExtensionManifest>,
    private _settings?: JsonStore<ExtensionSettings>
  ) {}

  /**
   * Returns all extensions currently in the extension manifest
   */
  public getAll(): ExtensionMetadata[] {
    const extensions = this.manifest.read();
    return Object.values(extensions).filter(Boolean) as ExtensionMetadata[];
  }

  /**
   * Returns the extension manifest entry & settings for the specified extension ID
   * @param id Id of the extension to search for
   */
  public find(id: string) {
    return this.manifest.get(id);
  }

  /**
   * Loads all builtin extensions and remote extensions.
   */
  public async loadAll() {
    await ensureDir(this.remoteDir);
    await ensureDir(this.dataDir);

    await this.loadFromDir(this.builtinDir, true);
    await this.loadFromDir(this.remoteDir);

    await this.cleanManifest();
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
      const isEnabled = packageJson.composer?.enabled !== false;
      const metadata = extractMetadata(extensionInstallPath, packageJson);
      if (isEnabled) {
        this.updateManifest(metadata.id, {
          ...metadata,
          builtIn: isBuiltin,
        });
        await this.load(metadata.id);
      } else if (this.manifest.get(metadata.id)) {
        // remove the extension if it exists in the manifest
        this.updateManifest(metadata.id, undefined);
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

      if (!isSubdirectory(this.remoteDir, destination)) {
        throw new Error('Cannot install outside of the configured directory.');
      }

      await downloadPackage(name, version ?? 'latest', destination);

      const packageJson = await this.getPackageJson(name, this.remoteDir);
      if (packageJson) {
        this.updateManifest(packageJson.name, extractMetadata(destination, packageJson));
      }

      return name;
    } catch (err) {
      log('%O', err);
      throw new Error(`Unable to install ${packageNameAndVersion}`);
    }
  }

  public async load(id: string) {
    const metadata = this.manifest.get(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, security/detect-non-literal-require
      const extension = metadata?.path && require(metadata.path);

      if (!extension || !metadata) {
        throw new Error(`Extension not found: ${id}`);
      }

      const getSettings = () => {
        return this.getSettingsForExtension(metadata.id);
      };

      const registration = new ExtensionRegistration(ExtensionContext, metadata, getSettings, this.dataDir);
      if (typeof extension.default === 'function') {
        // the module exported just an init function
        await extension.default.call(null, registration);
      } else if (extension.default && extension.default.initialize) {
        // the module exported an object with an initialize method
        await extension.default.initialize.call(null, registration);
      } else if (extension.initialize && typeof extension.initialize === 'function') {
        // the module exported an object with an initialize method
        await extension.initialize.call(null, registration);
      } else {
        throw new Error('Could not init extension');
      }
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
    this.updateManifest(id, { enabled: true });

    await this.load(id);
  }

  /**
   * Disables an extension
   * @param id Id of the extension to be disabled
   */
  public async disable(id: string) {
    this.updateManifest(id, { enabled: false });

    // TODO: tear down extension?
  }

  /**
   * Removes a remote extension via NPM
   * @param id Id of the extension to be removed
   */
  public async remove(id: string) {
    const metadata = this.find(id);

    if (metadata) {
      log('Removing %s', id);

      if (metadata.builtIn) {
        this.updateManifest(id, { enabled: false });
        return;
      }

      log('Removing %s', id);
      await remove(metadata.path);
      this.updateManifest(id, undefined);
    } else {
      throw new Error(`Unable to remove extension: ${id}`);
    }
  }

  /**
   * Searches for an extension via NPM's search function
   * @param query The search query
   */
  public async search(query: string) {
    const results = await search(query);

    return results.filter((searchResult) => {
      const { id, keywords } = searchResult;
      return !this.find(id) && keywords.includes('extension');
    });
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

  public updateManifest(id: string, data: Partial<ExtensionMetadata> | undefined) {
    // remove from manifest
    if (data === undefined) {
      this.manifest.set(id, undefined);
    } else {
      const existingData = this.manifest.get(id);
      this.manifest.set(id, { ...existingData, ...data } as ExtensionMetadata);
    }
  }

  public get settingsSchema() {
    return {
      type: 'object',
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: this.combinedSettingsSchema,
      additionalProperties: false,
    } as JSONSchema7;
  }

  public getSettings(withDefaults = false) {
    const userSettings = this.settings.read();

    if (withDefaults) {
      log('Including defaults in settings.');
      Object.entries(this.combinedSettingsSchema).forEach(([key, schema]) => {
        if (!(key in userSettings) && schema.default) {
          userSettings[key] = schema.default;
        }
      });
    }

    return userSettings;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public updateSettings(newSettings: any) {
    log('Writing new settings. %O', newSettings);
    this.settings.write(newSettings);
  }

  private getSettingsForExtension(id: string) {
    const allSettings = this.getSettings(true);

    return Object.entries(allSettings).reduce((all, [key, value]) => {
      if (key.startsWith(id)) {
        all[key.replace(`${id}.`, '')] = value;
      }
      return all;
    }, {}) as ExtensionSettings;
  }

  private async cleanManifest() {
    for (const ext of this.getAll()) {
      if (!(await pathExists(ext.path))) {
        log('Removing %s. It is in the manifest but could not be located.', ext.id);
        this.remove(ext.id);
      }
    }
  }

  private async getPackageJson(id: string, dir: string): Promise<PackageJSON | undefined> {
    try {
      const extensionPackagePath = path.resolve(dir, id, 'package.json');
      log('fetching package.json for %s at %s', id, extensionPackagePath);
      const packageJson = await readJson(extensionPackagePath);
      return packageJson as PackageJSON;
    } catch (err) /* istanbul ignore next */ {
      log('Error getting package json for %s', id);
      log('%O', err);
    }
  }

  private get combinedSettingsSchema() {
    return this.getAll().reduce((all, e) => {
      const extSchema = mapKeys(e.configurationSchema ?? {}, (_, k) => `${e.id}.${k}`);

      return { ...all, ...extSchema };
    }, {} as ExtensionConfigurationSchema);
  }

  private get manifest() {
    /* istanbul ignore next */
    if (!this._manifest) {
      this._manifest = new JsonStore(settings.extensions.manifestPath as string, {});
    }

    return this._manifest;
  }

  private get settings() {
    /* istanbul ignore next */
    if (!this._settings) {
      this._settings = new JsonStore(settings.extensions.settingsPath, {});
    }

    return this._settings;
  }

  private get builtinDir() {
    return settings.extensions.builtinDir;
  }

  private get remoteDir() {
    return settings.extensions.remoteDir;
  }

  private get dataDir() {
    return settings.extensions.dataDir;
  }
}

const ExtensionManager = new ExtensionManagerImp();

export { ExtensionManager };
