// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';
import * as pathLib from 'path';

import { Express } from 'express';
import glob from 'globby';

class ComposerPluginRegistration {
  public loader: PluginLoader;
  private _name: string;

  constructor(loader: PluginLoader, name: string) {
    this.loader = loader;
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  public addWebRoute(type: string, url: string, callback: (req: any, res: any) => void) {
    return this.loader.addWebRoute(type, url, callback);
  }

  public addWebMiddleware(middleware: (req, res, next) => void) {
    return this.loader.addWebMiddleware(middleware);
  }

  public async setStorage(customStorageClass: any) {
    return this.loader.setStorage(customStorageClass);
  }

  public async addPublishMethod(plugin: Partial<PublishPlugin>) {
    return this.loader.addPublishMethod(this.name, plugin);
  }
}

interface PublishPlugin {
  publish: any;
  getStatus?: any;
  getHistory?: any;
  rollback?: any;
  [key: string]: any;
}

class PluginLoader {
  private webserver: Express | undefined;
  public extensions: {
    storage: {
      [key: string]: any;
    };
    publish: {
      [key: string]: Partial<PublishPlugin>;
    };
  };

  constructor() {
    // load any plugins present in the default folder
    // noop for now
    this.extensions = {
      storage: {},
      publish: {},
    };
  }

  public async loadPlugin(path: string, webserver?: Express) {
    console.log('LOAD THE PLUGIN LOCATED IN ', path);
    const packageJSON = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(packageJSON);

    if (webserver) {
      this.webserver = webserver;
    }

    const pluginRegistration = new ComposerPluginRegistration(this, json.name);
    if (json.extendsComposer) {
      const modulePath = path.replace(/package\.json$/, '');
      // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
      const thisPlugin = require(modulePath);
      console.log('TYPEOF PLUGIN', typeof thisPlugin);
      if (typeof thisPlugin.default === 'function') {
        console.log('This is a composer plugin that returned a function');
        // the module exported just an init function
        thisPlugin.default.call(null, pluginRegistration);
      } else if (thisPlugin.default && thisPlugin.default.initialize) {
        // the module exported an object with an initialize method
        thisPlugin.default.initialize.call(null, pluginRegistration);
      } else if (thisPlugin.initialize && typeof thisPlugin.initialize === 'function') {
        // the module exported an object with an initialize method
        thisPlugin.initialize.call(null, pluginRegistration);
      } else {
        console.error('Could not init plugin', modulePath);
      }
    } else {
      console.log('Not a Composer plugin');
    }
  }

  public async setStorage(customStorageClass: any) {
    if (!this.extensions.storage.customStorageClass) {
      this.extensions.storage.customStorageClass = customStorageClass;
    } else {
      throw new Error('Cannot redefine storage driver once set.');
    }
  }

  public async addPublishMethod(name: string, plugin: Partial<PublishPlugin>) {
    this.extensions.publish[name] = plugin;
  }

  public addWebMiddleware(middleware: (req, res, next) => void) {
    if (!this.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web middleware.');
    } else {
      this.webserver.use(middleware);
    }
  }

  public addWebRoute(type: string, url: string, callback: (req: any, res: any) => void) {
    if (!this.webserver) {
      throw new Error('Plugin loaded in context without webserver. Cannot add web route.');
    } else {
      console.log(`Add route ${type} ${url}`);
      switch (type.toLowerCase()) {
        case 'get':
          this.webserver.get(url, callback);
          break;
        case 'put':
          this.webserver.put(url, callback);
          break;
        case 'post':
          this.webserver.post(url, callback);
          break;
        case 'delete':
          this.webserver.delete(url, callback);
          break;
        default:
          throw new Error(`Unhandled web route type ${type}`);
      }
    }
  }

  public async loadPluginsFromFolder(path: string, webserver: Express) {
    if (webserver) {
      this.webserver = webserver;
    }

    console.log('LOAD PLUGINS FROM ', path);
    const plugins = await glob('*/package.json', { cwd: path, dot: true });
    console.log('FOUND LOCAL PLUGINS:', plugins);
    for (const p in plugins) {
      await this.loadPlugin(pathLib.join(path, plugins[p]));
    }
  }
}

const pluginLoader = new PluginLoader();
export default pluginLoader;
