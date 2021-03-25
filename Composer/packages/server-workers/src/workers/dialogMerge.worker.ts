// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { isMainThread, workerData, parentPort } from 'worker_threads';

import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';

import logger from '../logger';

const log = logger.extend('dialogMerge');

if (!isMainThread) {
  const realMerge = new SchemaMerger(
    [workerData.manifestFile, '!**/imported/**', '!**/generated/**'],
    path.join(workerData.currentProjectDataDir, 'schemas/sdk'),
    path.join(workerData.currentProjectDataDir, 'dialogs/imported'),
    false,
    false,
    log.extend('info'),
    log.extend('warn'),
    log.extend('error')
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

export type DialogMergeArgs = {
  manifestFile: string;
  currentProjectDataDir: string;
};
