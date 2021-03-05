// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from 'fs';
import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { FileInfo } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';

import { ResponseMsg } from './types';

class OrchestratorBuilder {
  private worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    const workerScriptPath = path.join(__dirname, 'orchestratorWorker.ts');
    if (fs.existsSync(workerScriptPath)) {
      // set exec arguments to empty, avoid fork nodemon `--inspect` error
      this.worker = fork(workerScriptPath, [], { execArgv: ['-r', 'ts-node/register'] });
    } else {
      // set exec arguments to empty, avoid fork nodemon `--inspect` error
      this.worker = fork(path.join(__dirname, 'orchestratorWorker.js'), [], { execArgv: [] });
    }
    this.worker.on('message', this.handleMsg.bind(this));
  }

  public async build(
    files: FileInfo[],
    modelPath: string,
    generatedFolderPath: string
  ): Promise<{ [key: string]: string }> {
    const msgId = uniqueId();
    const msg = { id: msgId, payload: { files, type: 'build', modelPath, generatedFolderPath } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      this.worker.send(msg);
    });
  }

  // Handle incoming calculation result
  public handleMsg(msg: ResponseMsg) {
    const { id, error, payload } = msg;
    if (error) {
      const reject = this.rejects[id];
      if (reject) reject(error);
    } else {
      const resolve = this.resolves[id];
      if (resolve) resolve(payload);
    }

    // purge used callbacks
    delete this.resolves[id];
    delete this.rejects[id];
  }

  public exit() {
    this.worker.kill();
  }
}

export { OrchestratorBuilder };
