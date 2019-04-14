import fs from 'fs';
import path from 'path';
import data from './data.json';

interface KVStore {
  get(key: string): any;
  set(key: string, value: any): void;
}

class JsonStore implements KVStore {
  private data: any;
  private filePath: string;

  get = (key: string): any => {
    if (key in this.data) {
      return this.data[key];
    } else {
      throw Error(`no such key ${key} in store`);
    }
  };

  set = (key: string, value: any): void => {
    this.data[key] = value;
    this.flush();
  };

  flush = () => {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + '\n');
  };

  constructor(jsonFilePath: string, data: any) {
    this.filePath = path.resolve(jsonFilePath);
    this.data = data;
  }
}

export const Store = new JsonStore('./data.json', data);
