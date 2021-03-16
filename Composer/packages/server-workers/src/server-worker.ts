// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { Worker } from 'worker_threads';

import type { TemplateInstallationArgs } from './workers/templateInstallation.worker';
import type { DialogMergeArgs } from './workers/dialogMerge.worker';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isElectron: boolean = process.versions && (process.versions as any).electron;

export type WorkerName = 'dialogMerge' | 'templateInstallation';

export class ServerWorker {
  public static async execute(
    workerName: 'dialogMerge',
    args: DialogMergeArgs,
    updateProcess?: (status: number, message: string) => void
  );
  public static async execute(
    workerName: 'templateInstallation',
    args: TemplateInstallationArgs,
    updateProcess?: (status: number, message: string) => void
  );
  public static async execute<T extends Record<string, unknown> = {}>(
    workerName: WorkerName,
    args: T,
    /**
     * Callback to update BackgroundProcessManager
     */
    updateProcess?: (status: number, message: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // used to reject in case of an unhandled error
      let hasRejected = false;

      const w = new Worker(this.getWorkerPath(workerName), {
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
        if (message?.error) {
          reject(message.error);
          hasRejected = true;
        }

        if (message?.status) {
          // TODO: should this take a dependency on BackgroundProcessManager?
          if (typeof updateProcess === 'function') updateProcess(202, message?.status);
        }
      });
    });
  }

  private static getWorkerPath(workerName: WorkerName) {
    if (isElectron) {
      return path.join(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (process as any).resourcesPath,
        `app.asar.unpacked/node_modules/@bfc/server-workers/lib/workers/${workerName}.worker.js`
      );
    } else {
      return path.resolve(__dirname, `./workers/${workerName}.worker.js`);
    }
  }
}
