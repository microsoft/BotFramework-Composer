import fs from 'fs';
import path from 'path';

import localInitData from './data.template.json';
import abhInitData from './abh-template.json';

const isHostedInAzure = !!process.env.WEBSITE_NODE_DEFAULT_VERSION;
const dataStorePath =
  isHostedInAzure && process.env.HOME
    ? path.resolve(process.env.HOME, './site/data.json')
    : path.resolve(__dirname, '../../data.json');

const initData = process.env.HOME ? abhInitData : localInitData;

// create data.json if not exits
if (!fs.existsSync(dataStorePath)) {
  fs.writeFileSync(dataStorePath, JSON.stringify(initData, null, 2) + '\n');
}

interface KVStore {
  get(key: string): any;
  set(key: string, value: any): void;
}

class JsonStore implements KVStore {
  private data: any;
  private filePath: string;

  get = (key: string): any => {
    this.readStore();

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

  constructor(jsonFilePath: string) {
    this.filePath = path.resolve(jsonFilePath);
    this.ensureStore();
  }

  private ensureStore() {
    if (!fs.existsSync(this.filePath)) {
      this.initializeStore();
    }
  }

  private initializeStore() {
    fs.writeFileSync(this.filePath, JSON.stringify(initData, null, 2) + '\n');
  }

  private readStore() {
    this.ensureStore();

    this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
  }
}

export const Store = new JsonStore(dataStorePath);
