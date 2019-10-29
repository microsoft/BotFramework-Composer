/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
export class ClientStorage {
  private storage: Storage;

  constructor(storageLocation: Storage = window.localStorage) {
    this.storage = storageLocation;
  }

  set<T = any>(key: string, val: T): T | void {
    if (val === undefined) {
      return this.remove(key);
    }
    this.storage.setItem(key, this._serialize(val));
    return val;
  }

  get<T = any>(key: string, def?: T): T {
    const val = this._deserialize(this.storage.getItem(key));
    return val === undefined ? def : val;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  getAll(): { [key: string]: any } {
    const ret = {};
    this._forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  _forEach(callback: (key: string, val: any) => void) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        callback(key, this.get(key));
      }
    }
  }

  _serialize(val: any): string {
    return JSON.stringify(val);
  }

  _deserialize(val: any): any {
    if (typeof val !== 'string') {
      return undefined;
    }

    try {
      return JSON.parse(val);
    } catch (error) {
      return val || undefined;
    }
  }
}

const storage = new ClientStorage();

export default storage;
