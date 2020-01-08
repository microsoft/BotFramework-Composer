// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';
import glob from 'globby';

// import { Store } from '../store/store';

class PluginLoader {
  constructor() {
    // load any plugins present in the default folder
  }

  public loadPlugin(path: string) {
    // noop yet
    fs.readFileSync(path);
  }

  public async loadPluginsFromFolder(path: string) {
    console.log('LOAD PLUGINS FROM ', path);
    const plugins = await glob('*/package.json', { cwd: path, dot: true });
    console.log('FOUND LOCAL PLUGINS:', plugins);
  }
}

const pluginLoader = new PluginLoader();
export default pluginLoader;
