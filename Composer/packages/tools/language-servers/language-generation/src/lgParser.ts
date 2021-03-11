// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fork, ChildProcess } from 'child_process';
import path from 'path';

import { lgImportResolverGenerator, LgFile, ResolverResource } from '@bfc/shared';
import uniqueId from 'lodash/uniqueId';
import { lgUtil } from '@bfc/indexers';
import uniq from 'lodash/uniq';

import { getSuggestionEntities, extractLUISContent, suggestionAllEntityTypes, findAllVariables } from './utils';

const isTest = process.env?.NODE_ENV === 'test';
export interface WorkerMsg {
  id: string;
  type: 'parse' | 'updateTemplate' | 'extractLuisEntity' | 'extractLGVariables';
  error?: any;
  payload?: any;
}

class LgParserWithoutWorker {
  public async parse(id: string, content: string, lgFiles: ResolverResource[]): Promise<LgFile> {
    return lgUtil.parse(id, content, lgFiles);
  }
  public async updateTemplate(
    lgFile: LgFile,
    templateName: string,
    template: { name?: string; parameters?: string[]; body?: string },
    lgFiles: ResolverResource[]
  ): Promise<LgFile> {
    const lgImportResolver = lgImportResolverGenerator(lgFiles, '.lg');
    return lgUtil.updateTemplate(lgFile, templateName, template, lgImportResolver);
  }

  public async extractLuisEntity(luContents: string[]): Promise<{ suggestEntities: string[] }> {
    let suggestEntities: string[] = [];
    if (luContents) {
      for (const content of luContents) {
        const luisJson = await extractLUISContent(content);
        suggestEntities = suggestEntities.concat(getSuggestionEntities(luisJson, suggestionAllEntityTypes));
      }
    }

    return { suggestEntities: uniq(suggestEntities) };
  }

  public extractLGVariables(curCbangedFile: string | undefined, lgFiles: string[]) {
    let result: string[] = [];
    if (curCbangedFile) {
      result = findAllVariables(curCbangedFile);
    } else {
      result = findAllVariables(lgFiles);
    }

    return { lgVariables: uniq(result) };
  }
}

class LgParserWithWorker {
  private static _worker: ChildProcess;
  private resolves = {};
  private rejects = {};

  constructor() {
    LgParserWithWorker.worker.on('message', this.handleMsg.bind(this));
  }

  public async parse(id: string, content: string, lgFiles: ResolverResource[]): Promise<LgFile> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'parse', payload: { id, content, lgFiles } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LgParserWithWorker.worker.send(msg);
    });
  }

  public async updateTemplate(
    lgFile: LgFile,
    templateName: string,
    template: { name?: string; parameters?: string[]; body?: string },
    lgFiles: ResolverResource[]
  ): Promise<LgFile> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'updateTemplate', payload: { lgFile, templateName, template, lgFiles } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LgParserWithWorker.worker.send(msg);
    });
  }

  public async extractLuisEntity(luContents: string[]): Promise<{ suggestEntities: string[] }> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'extractLuisEntity', payload: { luContents } };
    return new Promise((resolve, reject) => {
      this.resolves[msgId] = resolve;
      this.rejects[msgId] = reject;
      LgParserWithWorker.worker.send(msg);
    });
  }

  public async extractLGVariables(
    curCbangedFile: string | undefined,
    lgFiles: string[]
  ): Promise<{ lgVariables: string[] }> {
    const msgId = uniqueId();
    const msg = { id: msgId, type: 'extractLGVariables', payload: { curCbangedFile, lgFiles } };
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
