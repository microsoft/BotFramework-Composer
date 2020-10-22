// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStore } from './store';

export class MemoryStore<T extends object> implements IStore<T> {
  private data: T;

  constructor(private defaultValue: T) {
    this.data = Object.assign({}, this.defaultValue);
  }

  read() {
    return this.data;
  }

  write(newData: T) {
    this.data = Object.assign({}, newData);
  }

  reload() {}
}
