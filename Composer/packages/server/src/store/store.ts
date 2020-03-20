// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import log from '../logger';
import settings from '../settings';

import initData from './data.template';

const dataStorePath = settings.appDataPath;

const updateStore = () => {
  if (fs.existsSync(dataStorePath)) {
    const userData = JSON.parse(fs.readFileSync(dataStorePath, 'utf-8'));

    function compareKeys(a, b) {
      var aKeys = Object.keys(a).sort();
      var bKeys = Object.keys(b).sort();
      return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    if (!compareKeys(initData, userData)) {
      // it's safe to assume when keys are different, the user data is using an obsolete version
      log('data store version mismatch detected, re-init data store with latest data schema');
      fs.writeFileSync(dataStorePath, JSON.stringify(initData, null, 2) + '\n');
    }
  }
};

updateStore();

interface KVStore {
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
}

class JsonStore implements KVStore {
  private data: any;
  private filePath: string;

  get = (key: string, defaultValue?: any): any => {
    this.readStore();

    if (key in this.data) {
      return this.data[key];
    } else if (defaultValue) {
      // when default value is present, save it
      this.set(key, defaultValue);
      return defaultValue;
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
      log('data.json not found. Re-initializing with initial data.');
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
