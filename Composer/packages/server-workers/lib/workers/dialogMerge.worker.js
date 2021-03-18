'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const path_1 = tslib_1.__importDefault(require('path'));
const worker_threads_1 = require('worker_threads');
const schemaMerger_1 = require('@microsoft/bf-dialog/lib/library/schemaMerger');
const logger_1 = tslib_1.__importDefault(require('../logger'));
const log = logger_1.default.extend('dialogMerge');
if (!worker_threads_1.isMainThread) {
  const realMerge = new schemaMerger_1.SchemaMerger(
    [worker_threads_1.workerData.manifestFile, '!**/imported/**', '!**/generated/**'],
    path_1.default.join(worker_threads_1.workerData.currentProjectDataDir, 'schemas/sdk'),
    path_1.default.join(worker_threads_1.workerData.currentProjectDataDir, 'dialogs/imported'),
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
      worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0
        ? void 0
        : worker_threads_1.parentPort.postMessage({ error: err });
      process.exit(1);
    });
}
//# sourceMappingURL=dialogMerge.worker.js.map
