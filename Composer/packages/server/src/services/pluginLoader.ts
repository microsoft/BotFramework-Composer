// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';
import * as pathLib from 'path';

import glob from 'globby';

class PluginLoader {
  public extensions: {
    storage: {
      [key: string]: any;
    };
  };

  constructor() {
    // load any plugins present in the default folder
    // noop for now
    this.extensions = {
      storage: {},
    };
  }

  public async loadPlugin(path: string) {
    console.log('LOAD THE PLUGIN LOCATED IN ', path);
    const packageJSON = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(packageJSON);

    if (json.extendsComposer) {
      const modulePath = path.replace(/package\.json$/, '');
      const thisPlugin = require(modulePath);
      console.log('This is a composer plugin!');
      if (json.extendsComposer.storage) {
        // grab a pointer to the exported class we want so we can use it later.
        this.extensions.storage.customStorageClass = thisPlugin[json.extendsComposer.storage.className];
      }
    } else {
      console.log('Not a Composer plugin');
    }
  }

  public async loadPluginsFromFolder(path: string) {
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
