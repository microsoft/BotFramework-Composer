// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import { promisify } from 'util';

import rimraf from 'rimraf';
import * as fs from 'fs-extra';

import { copyDir } from './copyDir';
import { IFileStorage } from './interface';

const exec = promisify(require('child_process').exec);

const removeDirAndFiles = promisify(rimraf);

export default async (composer: any): Promise<void> => {
  if (process.env.VA_CREATION) {
    // register the base template which will appear in the NEw Bot modal
    composer.addBotTemplate({
      id: 'va-core',
      name: 'VA Core',
      description: 'The core of your new VA - ready to run, just add skills!',
      path: path.resolve(__dirname, '../template'),
    });
  }
};
