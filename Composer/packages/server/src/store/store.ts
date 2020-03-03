// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import log from '../logger';
import settings from '../settings';

import localInitData from './data.template';
import abhInitData from './abh-template.json';
import { runMigrations } from './migrations';

const isHostedInAzure = !!process.env.WEBSITE_NODE_DEFAULT_VERSION;
const dataStorePath =
  isHostedInAzure && process.env.HOME ? path.resolve(process.env.HOME, './site/data.json') : settings.appDataPath;

let initData = isHostedInAzure ? abhInitData : localInitData;

if (fs.existsSync(dataStorePath)) {
  const userData = JSON.parse(fs.readFileSync(dataStorePath, 'utf-8'));
  initData = runMigrations(userData);
} else {
  log('Database not found. Seeding data.json with: %O', initData);
}

fs.writeFileSync(dataStorePath, JSON.stringify(initData, null, 2) + '\n');

if (isHostedInAzure) {
  // for some very odd reason on Azure webapp, fs.readFileSync after writeFileSync doesn't
  // always find the file, add one more io to kick the  virtual file system
  fs.appendFileSync(dataStorePath, ' ');
}

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
