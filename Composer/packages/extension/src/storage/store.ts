// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { existsSync, writeJsonSync, readJsonSync, unlinkSync } from 'fs-extra';

export type IStore<T> = {
  read: () => T;
  write: (data: T) => void;
  reload: () => void;
  destroy: () => void;
};

export class Store<T extends object> implements IStore<T> {
  private path: string;
  private data: T;

  public constructor(storePath: string, private defaultValue: T, private _log?: debug.Debugger) {
    this.path = storePath;
    this.data = defaultValue;

    if (!existsSync(this.path)) {
      this.log('%s does not exist yet. Writing file to path: %s', path.basename(this.path), this.path);
      writeJsonSync(this.path, defaultValue, { spaces: 2 });
    }

    this.readFromDisk();
  }

  public read() {
    return this.data;
  }

  public write(data: T) {
    this.data = data;
    this.writeToDisk();
  }

  public reload() {
    this.readFromDisk();
  }

  public destroy() {
    unlinkSync(this.path);
  }

  private readFromDisk() {
    try {
      const data: T = readJsonSync(this.path);
      this.data = data ?? this.defaultValue;
    } catch (e) {
      this.log('Error reading %s: %O', this.path, e);
    }
  }

  private writeToDisk() {
    try {
      writeJsonSync(this.path, this.data, { spaces: 2 });
    } catch (e) {
      this.log('Error writing %s: %s', this.path, e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(formatter: any, ...args: any[]) {
    if (this._log) {
      this._log(formatter, ...args);
    }
  }
}
