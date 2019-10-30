// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class ClientStorage {
  private storage: Storage;
  private prefix = 'composer';

  constructor(storageLocation: Storage = window.localStorage, prefix?: string) {
    this.storage = storageLocation;
    if (prefix) {
      this.prefix = prefix;
    }
  }

  public set<T = any>(key: string, val: T): T | void {
    if (val === undefined) {
      return this.remove(this._prefix(key));
    }
    this.storage.setItem(this._prefix(key), this._serialize(val));
    return val;
  }

  public get<T = any>(key: string, def?: T): T {
    const val = this._deserialize(this.storage.getItem(this._prefix(key)));
    return val === undefined ? def : val;
  }

  public has(key: string): boolean {
    return this.get(this._prefix(key)) !== undefined;
  }

  public remove(key: string): void {
    this.storage.removeItem(this._prefix(key));
  }

  public clear(): void {
    this.storage.clear();
  }

  public getAll(): { [key: string]: any } {
    const ret = {};
    this._forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  private _forEach(callback: (key: string, val: any) => void) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        callback(key.replace(`${this.prefix}:`, ''), this.get(key));
      }
    }
  }

  private _serialize(val: any): string {
    return JSON.stringify(val);
  }

  private _deserialize(val: any): any {
    if (typeof val !== 'string') {
      return undefined;
    }

    try {
      return JSON.parse(val);
    } catch (error) {
      return val || undefined;
    }
  }

  private _prefix(key: string): string {
    return `${this.prefix}:${key}`;
  }
}

const storage = new ClientStorage();

export default storage;
