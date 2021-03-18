'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const path_1 = tslib_1.__importDefault(require('path'));
const worker_threads_1 = require('worker_threads');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isElectron = process.versions && process.versions.electron;
class ServerWorker {
  static execute(
    workerName,
    args,
    /**
     * Callback to update BackgroundProcessManager
     */
    updateProcess
  ) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        // used to reject in case of an unhandled error
        let hasRejected = false;
        const w = new worker_threads_1.Worker(this.getWorkerPath(workerName), {
          workerData: args,
        });
        w.on('error', (err) => {
          reject(err);
          hasRejected = true;
        });
        w.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else if (!hasRejected) {
            reject(new Error(`Unknown error in ${workerName} worker.`));
          }
        });
        w.on('message', (message) => {
          if (message === null || message === void 0 ? void 0 : message.error) {
            reject(message.error);
            hasRejected = true;
          }
          if (message === null || message === void 0 ? void 0 : message.status) {
            // TODO: should this take a dependency on BackgroundProcessManager?
            if (typeof updateProcess === 'function')
              updateProcess(202, message === null || message === void 0 ? void 0 : message.status);
          }
        });
      });
    });
  }
  static getWorkerPath(workerName) {
    if (isElectron) {
      return path_1.default.join(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        process.resourcesPath,
        `app.asar.unpacked/node_modules/@bfc/server-workers/lib/workers/${workerName}.worker.js`
      );
    } else {
      return path_1.default.resolve(__dirname, `./workers/${workerName}.worker.js`);
    }
  }
}
exports.ServerWorker = ServerWorker;
//# sourceMappingURL=server-worker.js.map
