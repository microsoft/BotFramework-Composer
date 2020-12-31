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

  public get(key: string): T | undefined;
  public get(key: string, def: T): T;
  public get(key: string, def?: T): T | undefined {
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

  public getAll(): { [key: string]: TextDecoderOptions } {
    const ret = {};
    this.forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  private forEach(callback: (key: string, val: T) => void) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key != null) {
        const val = this.get(key);
        if (val != null) callback(key.replace(`${this._prefix}:`, ''), val);
      }
    }
  }

  private serialize(val: T): string {
    return JSON.stringify(val);
  }

  private deserialize(val: any): T | undefined {
    if (typeof val !== 'string') {
      return undefined;
    }

    try {
      return JSON.parse(val);
    } catch (error) {
      return undefined;
    }
  }

  private prefix(key: string): string {
    return `${this._prefix}:${key}`;
  }
}

const storage = new ClientStorage<any>();

export default storage;
