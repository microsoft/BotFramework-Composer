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
