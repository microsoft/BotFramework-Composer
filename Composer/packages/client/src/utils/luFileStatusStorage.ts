// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';

import storage, { ClientStorage } from './storage';

const KEY = 'LuFileStatus';

interface ILuFileStatus {
  [fileId: string]: boolean;
}

class LuFileStatusStorage {
  private storage: ClientStorage;
  private _all: { [botName: string]: ILuFileStatus };

  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }

  public get(botName: string) {
    return this._all[botName] || {};
  }

  public updateFile(botName: string, fileId: string) {
    if (!this._all[botName]) {
      this._all[botName] = {};
    }
    this._all[botName][fileId] = false;
    this.storage.set(KEY, this._all);
  }

  public removeFile(botName: string, fileId: string) {
    if (this._all[botName]?.[fileId]) {
      delete this._all[botName][fileId];
      this.storage.set(KEY, this._all);
    }
  }

  public createFile(botName: string, fileId: string) {
    this.updateFile(botName, fileId);
  }

  public checkFileStatus(botName: string, fileId: string) {
    if (this._all === {} || typeof this._all[botName]?.[fileId] === 'undefined') {
      this.updateFile(botName, fileId);
    }
  }

  public publishAll(botName: string) {
    keys(this._all[botName]).forEach(key => {
      this._all[botName][key] = true;
    });
    this.storage.set(KEY, this._all);
  }
}

export default new LuFileStatusStorage();
