// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { existsSync, writeJsonSync, readJsonSync, unlinkSync } from 'fs-extra';

type StoreData = { [key: string]: unknown };
export class Store<T extends StoreData = StoreData> {
  private path: string;
  private data: Partial<T>;

  public constructor(storePath: string, private defaultValue: T, private _log?: debug.Debugger) {
    this.path = storePath;
    this.data = { ...defaultValue };

    if (!existsSync(this.path)) {
      this.log('%s does not exist yet. Writing file to path: %s', path.basename(this.path ?? ''), this.path);
      this.writeToDisk();
    } else {
      this.readFromDisk();
    }
  }

  public readAll() {
    this.readFromDisk();
    return this.data;
  }

  public read(key: string): unknown | undefined {
    this.readFromDisk();
    return this.data[key];
  }

  public write(key: string, value: unknown) {
    this.data = { ...this.data, [key]: value };
    this.writeToDisk();
  }

  public delete(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...newData } = this.data;
    this.data = newData as Partial<T>;
    this.writeToDisk();
  }

  public replace(newData: Partial<T>) {
    this.data = { ...newData };
    this.writeToDisk();
  }

  public destroy() {
    unlinkSync(this.path);
  }

  private readFromDisk() {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const data: Partial<T> = readJsonSync(this.path);
        this.data = data ?? this.defaultValue;
      } catch (e) {
        this.log('Error reading %s: %O', this.path, e);
      }
    }
  }

  private writeToDisk() {
    if (process.env.NODE_ENV !== 'test') {
      try {
        writeJsonSync(this.path, this.data, { spaces: 2 });
      } catch (e) {
        this.log('Error writing %s: %s', this.path, e);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(formatter: any, ...args: any[]) {
    if (this._log) {
      this._log(formatter, ...args);
    }
  }
}
