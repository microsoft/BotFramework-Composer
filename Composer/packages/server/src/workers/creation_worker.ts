// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Worker, isMainThread, workerData } from 'worker_threads';

import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';
import Environment from 'yeoman-environment';

import { Path } from '../utility/path';
import { BotProject } from '../models/bot/botProject';
import log from '../logger';

export async function runMergeWorker(manifestFile: string, currentProject: BotProject) {
  if (isMainThread) {
    console.log('\n\n\n\n\n In the main thread \n\n\n\n\n\n');
    return new Promise<void>((resolve, reject) => {
      const w = new Worker(__filename, {
        workerData: { manifestFile, currentProject },
      });
      w.on('end', () => {
        resolve();
      });
    });
  } else {
    console.log('\n\n\n\n\n Im in a worker!!!!', workerData, '\n\n\n\n');
    const realMerge = new SchemaMerger(
      [manifestFile, '!**/imported/**', '!**/generated/**'],
      Path.join(currentProject.dataDir, 'schemas/sdk'),
      Path.join(currentProject.dataDir, 'dialogs/imported'),
      false,
      false,
      console.log,
      console.warn,
      console.error
    );

    await realMerge.merge();
  }
}

export async function runTemplateInstallationWorker(
  packageName: string,
  packageVersion: string,
  yeomanEnv: Environment
) {
  if (isMainThread) {
    console.log('\n\n\n\n\n In the main thread \n\n\n\n\n\n');
    return new Promise<void>((resolve, reject) => {
      const w = new Worker(__filename, {
        workerData: { packageName, packageVersion, yeomanEnv },
      });
      w.on('end', () => {
        resolve();
      });
    });
  } else {
    console.log('\n\n\n\n\n Im in a worker!!!!', workerData, '\n\n\n\n');
    await yeomanEnv.installLocalGenerators({ [packageName]: packageVersion });

    log('Looking up local packages');
    await yeomanEnv.lookupLocalPackages();
  }
}
