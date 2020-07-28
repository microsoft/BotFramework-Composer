// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import set from 'lodash/set';

import storage from './storage';

const KEY = 'LanguageSettings';

class LanguageStorage {
  private storage;
  private _all;
  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }
  get(botName: string) {
    return this._all[botName] || {};
  }
  setField(botName: string, field: string, value: any) {
    let current = this._all[botName];
    if (!current) {
      current = {};
    }
    set(current, field, value);
    this._all[botName] = current;
    this.storage.set(KEY, this._all);
  }
  remove(botName: string) {
    delete this._all[botName];
    this.storage.set(KEY, this._all);
  }

  setLocale(botName: string, locale: string) {
    this.setField(botName, 'locale', locale);
  }
}

export default new LanguageStorage();
