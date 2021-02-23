// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

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

export class JsonStore<T = any> {
  private data: T;
  private filePath: string;

  constructor(jsonFilePath: string, initialValue: T) {
    this.filePath = path.resolve(jsonFilePath);
    this.data = initialValue;
    this.ensureStore();
  }

  public read(): T {
    this.readStore();
    return this.data;
  }

  public write(newData: T) {
    this.data = newData;
    this.flush();
  }

  public get<K extends keyof T>(key: K): T[K] | undefined;
  public get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  public get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
    this.readStore();
    if (key in this.data) {
      return this.data[key];
    } else if (defaultValue) {
      // when default value is present, save it
      this.set(key, defaultValue);
      return defaultValue;
    }
  }

  public set<K extends keyof T>(key: K, value?: T[K]): void {
    if (value === undefined) {
      delete this.data[key];
    } else {
      this.data[key] = value;
    }
    this.flush();
  }

  public flush() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + '\n');
  }

  private ensureStore() {
    if (!fs.existsSync(this.filePath)) {
      log('%s not found. Re-initializing with initial data.', this.filePath);
      this.initializeStore();
    }
  }

  private initializeStore() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + '\n');
  }

  private readStore() {
    this.ensureStore();

    this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
  }
}

export const Store = new JsonStore(dataStorePath, initData);
