// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class ClientStorage<T> {
  private storage: Storage;
  private _prefix = 'composer';

  constructor(storageLocation: Storage = window.localStorage, prefix?: string) {
    this.storage = storageLocation;
    if (prefix) {
      this._prefix = prefix;
    }
  }

  public set(key: string, val: T): T | void {
    if (val === undefined) {
      return this.remove(this.prefix(key));
    }
    this.storage.setItem(this.prefix(key), this.serialize(val));
    return val;
  }

  public get(key: string, def?: T): T | undefined {
    const item: string | null = this.storage.getItem(this.prefix(key));
    if (item == null) return undefined;
    try {
      const val = this.deserialize(item);
      return val === undefined ? def : val;
    } catch (e) {
      return undefined;
    }
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

  public getAll(): { [key: string]: T } {
    const ret = {};
    this.forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  private forEach(callback: (key: string, val: T) => void) {
    for (let i = 0; i < this.storage.length; i++) {
      // note: the definition of Storage.length ensures that key will never be null, but the type-checker doesn't know this,
      // so this '' default will never actually be used
      const key = this.storage.key(i) ?? '';
      const value = this.get(key);
      if (value != null) callback(key.replace(`${this._prefix}:`, ''), value);
    }
  }

  private serialize(val: T): string {
    return JSON.stringify(val);
  }

  private deserialize(val: string): T {
    return JSON.parse(val);
  }

  private prefix(key: string): string {
    return `${this._prefix}:${key}`;
  }
}
