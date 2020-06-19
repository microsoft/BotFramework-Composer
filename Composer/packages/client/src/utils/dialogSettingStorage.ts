// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import set from 'lodash/set';

import storage from './storage';

const KEY = 'DialogSetting';

class DialogSettingStorage {
  private storage;
  private _all;
  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }
  get(projectId: string) {
    return this._all[projectId] || {};
  }
  setField(projectId: string, field: string, value: any) {
    let current = this._all[projectId];
    if (!current) {
      current = {};
    }
    set(current, field, value);
    this._all[projectId] = current;
    this.storage.set(KEY, this._all);
  }
  remove(projectId: string) {
    delete this._all[projectId];
    this.storage.set(KEY, this._all);
  }
}

export default new DialogSettingStorage();
