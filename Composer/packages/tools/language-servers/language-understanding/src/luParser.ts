// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { parser } from '@microsoft/bf-lu/lib/parser';
import { updateIntent, checkSection } from '@bfc/indexers/lib/utils/luUtil';
import { luIndexer } from '@bfc/indexers';
import { LuFile, ILUFeaturesConfig, LuIntentSection, Diagnostic } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';

export const isTest = process.env?.NODE_ENV === 'test';
export interface WorkerMsg {
  id: string;
  type: 'parse' | 'updateIntent' | 'parseFile' | 'checkSection' | 'getFoldingRanges';
  error?: any;
  payload?: any;
}

export class LuParserWithoutWorker {
  public async parse(content: string, id = '', config: ILUFeaturesConfig): Promise<LuFile> {
    return luIndexer.parse(content, id, config);
  }
  public async updateIntent(
    luFile: LuFile,
    intentName: string,
    intent: { Name?: string; Body?: string } | null,
    luFeatures: ILUFeaturesConfig
  ): Promise<LuFile> {
    return updateIntent(luFile, intentName, intent, luFeatures);
  }
  public async parseFile(text, log, locale): Promise<any> {
    return await parser.parseFile(text, log, locale);
  }
  public async checkSection(intent: LuIntentSection, enableSections = true): Promise<Diagnostic[]> {
    return checkSection(intent, enableSections);
  }
}

class LuParserWithWorker {
  private static _worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    LuParserWithWorker.worker.on('message', this.handleMsg.bind(this));
  }

  public async parse(content: string, id = '', config: ILUFeaturesConfig): Promise<LuFile> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'parse', payload: { id, content, config } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LuParserWithWorker.worker.send(msg);
    });
  }
  public async updateIntent(
    luFile: LuFile,
    intentName: string,
    intent: { Name?: string; Body?: string } | null,
    luFeatures: ILUFeaturesConfig
  ): Promise<LuFile> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'updateTemplate', payload: { luFile, intentName, intent, luFeatures } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LuParserWithWorker.worker.send(msg);
    });
  }

  public async parseFile(text: string, log, locale: string): Promise<any> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'updateTemplate', payload: { text, log, locale } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LuParserWithWorker.worker.send(msg);
    });
  }

  public async checkSection(intent: LuIntentSection, enableSections = true): Promise<Diagnostic[]> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'checkSection', payload: { intent, enableSections } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LuParserWithWorker.worker.send(msg);
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

    const workerScriptPath = path.join(__dirname, 'luWorker.js');
    // set exec arguments to empty, avoid fork nodemon `--inspect` error
    this._worker = fork(workerScriptPath, [], { execArgv: [] });
    return this._worker;
  }
}

// Do not use worker when running test.
const LuParser = LuParserWithWorker;

export { LuParser };
