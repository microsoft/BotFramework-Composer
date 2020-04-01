// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';

import storage, { ClientStorage } from './storage';

const KEY = 'LuFileStatus';

interface ILuFileStatus {
  [fileId: string]: boolean;
}

// add luis publish status to local storage
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

  public updateFileStatus(botName: string, fileId: string, value = false) {
    if (!botName) return;
    if (!this._all[botName]) {
      this._all[botName] = {};
    }
    if (this._all[botName][fileId] !== value) {
      this._all[botName][fileId] = value;
      this.storage.set(KEY, this._all);
    }
  }

  public removeFileStatus(botName: string, fileId: string) {
    if (!botName) return;
    if (typeof this._all[botName][fileId] !== 'undefined') {
      delete this._all[botName][fileId];
      this.storage.set(KEY, this._all);
    }
  }

  public checkFileStatus(botName: string, fileIds: string[]) {
    fileIds.forEach(id => this.updateFileStatus(botName, id, false));
  }

  public publishAll(botName: string) {
    if (!botName) return;
    keys(this._all[botName]).forEach(key => {
      this._all[botName][key] = true;
    });
    this.storage.set(KEY, this._all);
  }

  public removeAllStatuses(botName: string) {
    if (this._all[botName]) {
      delete this._all[botName];
      this.storage.set(KEY, this._all);
    }
  }
}

export default new LuFileStatusStorage();
