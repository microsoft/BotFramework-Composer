// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { Templates, Diagnostic } from 'botbuilder-lg';
import { importResolverGenerator } from '@bfc/shared';
import { ResolverResource } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';

const isTest = process.env?.NODE_ENV === 'test';
export interface WorkerMsg {
  id: string;
  error?: any;
  payload?: any;
}

function createDiagnostic(diagnostic: Diagnostic) {
  const { code, range, severity, source, message } = diagnostic;
  const { start, end } = range;
  return {
    code,
    range: {
      start: { line: start.line, character: start.character },
      end: { line: end.line, character: end.character },
    },
    severity,
    source,
    message,
  };
}

class LgParserWithoutWorker {
  public async parseText(content: string, id: string, resources: ResolverResource[]) {
    const resolver = importResolverGenerator(resources, '.lg');
    const { allTemplates, allDiagnostics } = Templates.parseText(content, id, resolver);
    const templates = allTemplates.map((item) => ({ name: item.name, parameters: item.parameters, body: item.body }));
    const diagnostics = allDiagnostics.map((item) => createDiagnostic(item));
    return { templates, diagnostics };
  }
}

class LgParserWithWorker {
  private worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    const workerScriptPath = path.join(__dirname, 'lgWorker.js');
    // set exec arguments to empty, avoid fork nodemon `--inspect` error
    this.worker = fork(workerScriptPath, [], { execArgv: [] });
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

// Do not use worker when running test.
const LgParser = isTest ? LgParserWithoutWorker : LgParserWithWorker;

export { LgParser };
