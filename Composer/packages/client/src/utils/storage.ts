// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class ClientStorage {
  private storage: Storage;
  private _prefix = 'composer';

  constructor(storageLocation: Storage = window.localStorage, prefix?: string) {
    this.storage = storageLocation;
    if (prefix) {
      this._prefix = prefix;
    }
  }

  public set<T = any>(key: string, val: T): T | void {
    if (val === undefined) {
      return this.remove(this.prefix(key));
    }
    this.storage.setItem(this.prefix(key), this.serialize(val));
    return val;
  }

  public get<T = any>(key: string, def?: T): T {
    const val = this.deserialize(this.storage.getItem(this.prefix(key)));
    return val === undefined ? def : val;
  }

  public has(key: string): boolean {
    return this.get(this.prefix(key)) !== undefined;
  }

  public remove(key: string): void {
    this.storage.removeItem(this.prefix(key));
  }

  public clear(): void {
    this.storage.clear();
  }

  public getAll(): { [key: string]: any } {
    const ret = {};
    this.forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  private forEach(callback: (key: string, val: any) => void) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        callback(key.replace(`${this._prefix}:`, ''), this.get(key));
      }
    }
  }

  private serialize(val: any): string {
    return JSON.stringify(val);
  }

  private deserialize(val: any): any {
    if (typeof val !== 'string') {
      return undefined;
    }

    try {
      return JSON.parse(val);
    } catch (error) {
      return val || undefined;
    }
  }

  private prefix(key: string): string {
    return `${this._prefix}:${key}`;
  }
}

const storage = new ClientStorage();

export default storage;
