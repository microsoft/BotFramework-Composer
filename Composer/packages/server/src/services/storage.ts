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
import * as fs from 'fs';

import { Path } from '../utility/path';
import { StorageConnection, IFileStorage } from '../models/storage/interface';
import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';

const fileBlacklist = ['.DS_Store'];
const isValidFile = (file: string) => {
  return fileBlacklist.filter(badFile => badFile === file).length === 0;
};
class StorageService {
  private STORE_KEY = 'storageConnections';
  private storageConnections: StorageConnection[] = [];

  constructor() {
    this.storageConnections = Store.get(this.STORE_KEY);
  }

  public getStorageClient = (storageId: string): IFileStorage => {
    const conn = this.storageConnections.find(s => {
      return s.id === storageId;
    });
    if (conn === undefined) {
      throw new Error(`no storage connection with id ${storageId}`);
    }
    return StorageFactory.createStorageClient(conn);
  };

  public createStorageConnection = (connection: StorageConnection) => {
    // if id is already in store, skip it
    if (!this.storageConnections.find(item => item.id === connection.id)) {
      this.storageConnections.push(connection);
      Store.set(this.STORE_KEY, this.storageConnections);
    }
  };

  public getStorageConnections = (): StorageConnection[] => {
    return this.storageConnections.map(s => {
      const temp = Object.assign({}, s);
      temp.path = Path.resolve(s.path); // resolve path if path is relative, and change it to unix pattern
      return temp;
    });
  };

  public checkBlob = async (storageId: string, filePath: string): Promise<boolean> => {
    const storageClient = this.getStorageClient(storageId);
    return await storageClient.exists(filePath);
  };

  public getBlobDateModified = async (storageId: string, filePath: string) => {
    const storageClient = this.getStorageClient(storageId);
    try {
      const stat = await storageClient.stat(filePath);
      return stat.lastModified;
    } catch (err) {
      throw err;
    }
  };

  // return connent for file
  // return children for dir
  public getBlob = async (storageId: string, filePath: string) => {
    const storageClient = this.getStorageClient(storageId);
    try {
      const stat = await storageClient.stat(filePath);
      if (stat.isFile) {
        // NOTE: this behavior is not correct, we should NOT parse this file as json
        // becase it might not be json, this api is a more general file api than json file
        // didn't fix it because this is the previous behavior
        // TODO: fix this behavior and the upper layer interface accordingly
        return JSON.parse(await storageClient.readFile(filePath));
      } else {
        return {
          name: Path.basename(filePath),
          parent: Path.dirname(filePath),
          children: await this.getChildren(storageClient, filePath),
        };
      }
    } catch (err) {
      throw err;
    }
  };

  private isBotFolder = (path: string) => {
    // locate Main.dialog
    const mainPath = Path.join(path, 'ComposerDialogs/Main', 'Main.dialog');
    const isbot = fs.existsSync(mainPath);
    return isbot;
  };

  private getChildren = async (storage: IFileStorage, dirPath: string) => {
    // TODO: filter files, folder which have no read and write
    const children = (await storage.readDir(dirPath)).map(async childName => {
      try {
        if (childName === '') {
          return;
        }
        const childAbsPath = Path.join(dirPath, childName);
        const childStat = await storage.stat(childAbsPath);
        if (!isValidFile(childName)) {
          return;
        }
        return {
          name: childName,
          type: childStat.isDir ? (this.isBotFolder(childAbsPath) ? 'bot' : 'folder') : 'file',
          path: childAbsPath,
          lastModified: childStat.lastModified, // just keep the previous interface
          size: childStat.size, // just keep the previous interface
        };
      } catch (error) {
        return;
      }
    });
    // filter no access permission folder, witch value is null in children array
    const result = await Promise.all(children);
    return result.filter(item => !!item);
  };
}

const service = new StorageService();
export default service;
