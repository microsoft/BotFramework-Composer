// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';

import { Path } from '../utility/path';
import { BotProject } from '../models/bot/botProject';

if (!isMainThread) {
  const realMerge = new SchemaMerger(
    [workerData.manifestFile, '!**/imported/**', '!**/generated/**'],
    Path.join(workerData.dataDir, 'schemas/sdk'),
    Path.join(workerData.dataDir, 'dialogs/imported'),
    false,
    false,
    console.log,
    console.warn,
    console.error
  );

  realMerge
    .merge()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      parentPort?.postMessage({ error: err });
      process.exit(1);
    });
}

export function runDialogMerge(manifestFile: string, currentProject: BotProject) {
  return new Promise<void>((resolve, reject) => {
    const w = new Worker(__filename, {
      workerData: { manifestFile, dataDir: currentProject.dataDir },
    });
    w.on('exit', (returnCode) => {
      if (returnCode === 0) {
        resolve();
      }
    });
    w.on('message', (message) => {
      if (message?.error) {
        reject(message.error);
      }
    });
  });
}
