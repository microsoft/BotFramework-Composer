// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { importResolverGenerator } from '@bfc/shared';
import { ResolverResource } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';
import { lgIndexer } from '@bfc/indexers';

const isTest = process.env?.NODE_ENV === 'test';
export interface WorkerMsg {
  id: string;
  error?: any;
  payload?: any;
}

class LgParserWithoutWorker {
  public async parseText(content: string, id: string, resources: ResolverResource[]) {
    const lgImportResolver = importResolverGenerator(resources, '.lg');
    return lgIndexer.parse(content, id, lgImportResolver);
  }
}

class LgParserWithWorker {
  private static _worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    LgParserWithWorker.worker.on('message', this.handleMsg.bind(this));
  }

  public async parseText(content: string, id: string, resources: ResolverResource[]): Promise<any> {
    const msgId = uniqueId();
    const msg = { id: msgId, payload: { content, id, resources } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LgParserWithWorker.worker.send(msg);
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

  static get worker() {
    if (this._worker && !this._worker.killed) {
      return this._worker;
    }

    const workerScriptPath = path.join(__dirname, 'lgWorker.js');
    // set exec arguments to empty, avoid fork nodemon `--inspect` error
    this._worker = fork(workerScriptPath, [], { execArgv: [] });
    return this._worker;
  }
}

// Do not use worker when running test.
const LgParser = isTest ? LgParserWithoutWorker : LgParserWithWorker;

export { LgParser };
