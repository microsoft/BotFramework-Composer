// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ClientStorage } from './storage';

const KEY = 'RouterCache';

class RouterCache {
  private storage: ClientStorage<string>;
  private _all;

  constructor() {
    this.storage = new ClientStorage<string>(window.sessionStorage);
    this._all = this.storage.get(KEY) ?? {};
  }

  get(to: string) {
    return this._all[to] || {};
  }

  getAll() {
    return this._all;
  }

  set(linkTo: string, uri: string) {
    this._all[linkTo] = uri;
    this.storage.set(KEY, this._all);
  }

  cleanAll() {
    this._all = {};
    this.storage.set(KEY, this._all);
  }
}

export default new RouterCache();
