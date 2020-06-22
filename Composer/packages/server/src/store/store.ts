// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import log from '../logger';
import settings from '../settings';

import initData from './data.template';
import { runMigrations } from './migrations';

const dataStorePath = settings.appDataPath;

const migrateStore = () => {
  if (fs.existsSync(dataStorePath)) {
    const userData = JSON.parse(fs.readFileSync(dataStorePath, 'utf-8'));
    const migratedData = runMigrations(userData);
    fs.writeFileSync(dataStorePath, JSON.stringify(migratedData, null, 2) + '\n');
  }
};

migrateStore();

interface KVStore {
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
}

class JsonStore implements KVStore {
  private data: any;
  private filePath: string;

  public get<T = unknown>(key: string, defaultValue?: T): T {
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
  }

  public set<T = unknown>(key: string, value: T): void {
    this.data[key] = value;
    this.flush();
  }

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
