// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import childProcess from 'child_process';
import { promisify } from 'util';

import logger from '../../logger';

const log = logger.extend('plugins');

const exec = promisify(childProcess.exec);

const PLUGINS_DIR = path.resolve(__dirname, '../../.composer');

export class PluginManager {
  private dir = PLUGINS_DIR;

  constructor(pluginsDirectory?: string) {
    if (pluginsDirectory) {
      this.dir = pluginsDirectory;
    }
  }

  public async install(name: string, version = 'latest') {
    const cmd = `npm install --no-audit --prefix ${this.dir} ${name}@${version}`;
    log('Installing %s@%s to %s', name, version, this.dir);
    log(cmd);

    const { stdout } = await exec(cmd);

    log('%s', stdout);
  }
}
