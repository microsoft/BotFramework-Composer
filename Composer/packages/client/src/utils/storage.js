class Storage {
  constructor() {
    this.storage = window.localStorage;
  }

  set(key, val) {
    if (val === undefined) {
      return this.remove(key);
    }
    this.storage.setItem(key, this._serialize(val));
    return val;
  }

  get(key, def) {
    const val = this._deserialize(this.storage.getItem(key));
    return val === undefined ? def : val;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  remove(key) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  getAll() {
    const ret = {};
    this._forEach((key, val) => {
      ret[key] = val;
    });
    return ret;
  }

  _forEach(callback) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      callback(key, this.get(key));
    }
  }

  _serialize(val) {
    return JSON.stringify(val);
  }

  _deserialize(val) {
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

const storage = new Storage();

export default storage;
