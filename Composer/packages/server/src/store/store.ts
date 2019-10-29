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
import fs from 'fs';
import path from 'path';

import localInitData from './data.template';
import abhInitData from './abh-template.json';

const isHostedInAzure = !!process.env.WEBSITE_NODE_DEFAULT_VERSION;
const dataStorePath =
  isHostedInAzure && process.env.HOME
    ? path.resolve(process.env.HOME, './site/data.json')
    : path.resolve(__dirname, '../../data.json');

const initData = isHostedInAzure ? abhInitData : localInitData;

// create data.json if not exits
if (!fs.existsSync(dataStorePath)) {
  fs.writeFileSync(dataStorePath, JSON.stringify(initData, null, 2) + '\n');
  if (isHostedInAzure) {
    // for some very odd reason on Azure webapp, fs.readFileSync after writeFileSync doesn't
    // always find the file, add one more io to kick the  virtual file system
    fs.appendFileSync(dataStorePath, ' ');
  }
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
