// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { ResolverResource } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';

const devEnvs = ['test', 'development'];
const isDev = process.env.NODE_ENV && devEnvs.indexOf(process.env.NODE_ENV) > -1;

export interface WorkerMsg {
  id: string;
  error?: any;
  payload?: any;
}

// Wrapper class
export class LgParser {
  private worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    const fileName = isDev ? 'lgWorker.ts' : 'lgWorker.js';
    const execArgv = isDev ? ['-r', 'ts-node/register'] : [];
    const workerScriptPath = path.join(__dirname, fileName);
    this.worker = fork(workerScriptPath, [], { execArgv });
    this.worker.on('message', this.handleMsg.bind(this));
  }

  public async parseText(content: string, id: string, resources: ResolverResource[]): Promise<any> {
    const msgId = uniqueId();
    const msg = { id: msgId, payload: { content, id, resources } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      this.worker.send(msg);
    });
  }

  // Handle incoming calculation result
  public handleMsg(msg: WorkerMsg) {
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
}
