// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import childProcess from 'child_process';
import { promisify } from 'util';

import { readJson } from 'fs-extra';
import filter from 'lodash/filter';
import assign from 'lodash/assign';
import { pluginLoader } from '@bfc/plugin-loader';

import { Store } from '../../store/store';
import logger from '../../logger';

const log = logger.extend('plugins');

const exec = promisify(childProcess.exec);

const PLUGINS_DIR = path.resolve(__dirname, '../../../.composer');

interface PluginBundle {
  id: string;
  path: string;
}

interface PluginContributes {
  views?: {
    page?: {
      id: string;
      name: string;
      icon?: string;
      when?: string;
    }[];
  };
}

interface PluginConfig {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  configuration: object;
  /** path where module is installed */
  path: string;
  bundles: PluginBundle[];
  contributes: PluginContributes;
}

interface PluginInfo {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
}

interface PackageJSON {
  name: string;
  version: string;
  description: string;

  composer: any;
}

export class PluginManager {
  private dir = PLUGINS_DIR;
  private searchCache = new Map<string, PluginInfo>();

  constructor(pluginsDirectory?: string) {
    if (pluginsDirectory) {
      this.dir = pluginsDirectory;
    }
  }

  public getAll(opts: { enabled?: boolean } = {}) {
    const all = Store.get<PluginConfig[]>('plugins', []);

    return filter(all, opts) as PluginConfig[];
  }

  public find(id: string) {
    const all = this.getAll();

    return all.find((p) => p.id === id);
  }

  public async install(name: string, version?: string) {
    const packageNameAndVersion = version ? `${name}@${version}` : name;
    const cmd = `npm install --no-audit --prefix ${this.dir} ${packageNameAndVersion}`;
    log('Installing %s@%s to %s', name, version, this.dir);
    log(cmd);

    const { stdout, stderr } = await exec(cmd);

    log('%s', stdout);
    log('%s', stderr);

    const packageJson = await this.getPackageJson(name);

    if (packageJson) {
      const pluginPath = path.resolve(this.dir, 'node_modules', name);
      await this.updateStore(name, {
        id: name,
        name: packageJson.name,
        version: packageJson.version,
        enabled: true,
        // TODO: plugins can provide default configuration
        configuration: {},
        path: pluginPath,
        bundles: this.processBundles(pluginPath, packageJson.composer?.bundles ?? []),
        contributes: packageJson.composer?.contributes,
      });
    } else {
      throw new Error(`Unable to install ${packageNameAndVersion}`);
    }
  }

  public async loadAll() {
    await Promise.all(this.getAll({ enabled: true }).map((p) => this.load(p.id)));
  }

  public async load(id: string) {
    try {
      const modulePath = require.resolve(id, {
        paths: [`${PLUGINS_DIR}/node_modules`],
      });
      // eslint-disable-next-line @typescript-eslint/no-var-requires, security/detect-non-literal-require
      const plugin = require(modulePath);

      if (!plugin) {
        throw new Error('Plugin not found');
      }

      await pluginLoader.loadPlugin(id, '', plugin);
    } catch (err) {
      log('Unable to load plugin `%s`', id);
      log('%O', err);
      await this.remove(id);
      throw err;
    }
  }

  public async enable(id: string) {
    await this.updateStore(id, { enabled: true });

    // re-load plugin
  }

  public async disable(id: string) {
    await this.updateStore(id, { enabled: false });

    // tear down plugin?
  }

  public async remove(id: string) {
    const cmd = `npm uninstall --no-audit --prefix ${this.dir} ${id}`;
    log('Removing %s', id);
    log(cmd);

    const { stdout } = await exec(cmd);

    log('%s', stdout);

    const allPlugins = Store.get<PluginConfig[]>('plugins', []);
    Store.set(
      'plugins',
      allPlugins.filter((p) => p.id !== id)
    );
  }

  public async search(query: string) {
    const cmd = `npm search --json "keywords:botframework-composer ${query}"`;
    log(cmd);

    const { stdout } = await exec(cmd);

    try {
      const result = JSON.parse(stdout);
      if (Array.isArray(result)) {
        result.forEach((searchResult) => {
          const { name, keywords = [], version, description, links } = searchResult;
          if (keywords.includes('botframework-composer')) {
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

    return Array.from(this.searchCache.values());
  }

  public async getAllBundles(id: string) {
    const info = this.find(id);

    if (!info) {
      throw new Error('plugin not found');
    }

    return info.bundles ?? [];
  }

  public getBundle(id: string, bundleId: string): string | null {
    const info = this.find(id);

    if (!info) {
      throw new Error('plugin not found');
    }

    const bundle = info.bundles.find((b) => b.id === bundleId);

    if (!bundle) {
      throw new Error('bundle not found');
    }

    return bundle.path;
  }

  private async updateStore(pluginId: string, newSettings: Partial<PluginConfig>) {
    let allPlugins = Store.get<PluginConfig[]>('plugins', []);
    const currentSettings = allPlugins.find((p) => p.id === pluginId);

    if (currentSettings) {
      const updatedSettings = assign({}, currentSettings, newSettings);
      allPlugins = allPlugins.map((p) => {
        if (p.id === pluginId) {
          return updatedSettings;
        }

        return p;
      });
    } else {
      allPlugins.push(assign({} as PluginConfig, newSettings));
    }

    Store.set('plugins', allPlugins);
  }

  private async getPackageJson(id: string): Promise<PackageJSON | undefined> {
    try {
      const pluginPackagePath = path.resolve(this.dir, 'node_modules', id, 'package.json');
      log('fetching package.json for %s at %s', id, pluginPackagePath);
      const packageJson = await readJson(pluginPackagePath);
      return packageJson as PackageJSON;
    } catch (err) {
      log('Error getting package json for %s', id);
      console.error(err);
    }
  }

  private processBundles(pluginPath: string, bundles: PluginBundle[]) {
    return bundles.map((b) => ({
      ...b,
      path: path.resolve(pluginPath, b.path),
    }));
  }
}
