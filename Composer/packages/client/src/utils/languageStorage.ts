// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import set from 'lodash/set';

import { ClientStorage } from './storage';

const KEY = 'LanguageSettings';
interface LanguageStatus<T> {
  [fileId: string]: T;
}

type StoredData<T> = { [projectId: string]: LanguageStatus<T> };

class LanguageStorage<T> {
  private storage: ClientStorage<StoredData<T>>;
  private _all: StoredData<T>;

  constructor() {
    this.storage = new ClientStorage();
    this._all = this.storage.get(KEY) ?? {};
  }

  get(botName: string) {
    return this._all[botName] ?? {};
  }

  setField(botName: string, field: string, value: T) {
    const current = this.get(botName);
    set(current, field, value);
    this._all[botName] = current;
    this.storage.set(KEY, this._all);
  }

  remove(botName: string) {
    delete this._all[botName];
    this.storage.set(KEY, this._all);
  }

  setLocale(botName: string, locale: T) {
    this.setField(botName, 'locale', locale);
  }
}

export default new LanguageStorage<string>();
