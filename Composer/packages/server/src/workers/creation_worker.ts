/* eslint-disable no-undef */
/* eslint-disable security/detect-non-literal-require */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line security/detect-non-literal-require
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Worker, isMainThread, workerData } from 'worker_threads';

export function runWork() {
  if (isMainThread) {
    console.log('\n\n\n\n\n In the main thread \n\n\n\n\n\n');
    return new Promise<void>((resolve, reject) => {
      const w = new Worker(__filename, {
        workerData: { name: 'test', cwd: 'aefef' },
      });
      w.on('end', () => {
        resolve();
      });
    });
  } else {
    console.log('\n\n\n\n\n Im in a worker!!!!', workerData, '\n\n\n\n');
  }
}
