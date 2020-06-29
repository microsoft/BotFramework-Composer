// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import childProcess from 'child_process';
import { promisify } from 'util';

import filter from 'lodash/filter';
import assign from 'lodash/assign';
import { pluginLoader } from '@bfc/plugin-loader';

import { Store } from '../../store/store';
import logger from '../../logger';

const log = logger.extend('plugins');

const exec = promisify(childProcess.exec);

const PLUGINS_DIR = path.resolve(__dirname, '../../../.composer');

interface PluginConfig {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  configuration: object;
  /** path where module is installed */
  path: string;
}

interface PluginInfo {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
}

export class PluginManager {
  private dir = PLUGINS_DIR;
  private cache = new Map<string, PluginInfo>();

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
    // eslint-disable-next-line security/detect-non-literal-regexp
    const versionRegex = new RegExp(`${name}\\@(\\d+\\.\\d+\\.\\d+\\S*)`);
    const actualVersion = stdout.match(versionRegex);

    log('%s', stdout);
    log('%s', stderr);

    await this.updateStore(name, {
      id: name,
      // TODO: use better name
      name: name,
      version: actualVersion?.[1] ?? version,
      enabled: true,
      // TODO: plugins can provide default configuration
      configuration: {},
    });
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
            this.cache.set(name, {
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

    return Array.from(this.cache.values());
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
}
