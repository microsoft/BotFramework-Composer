// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { Path } from '../utility/path';
import { StorageConnection, IFileStorage } from '../models/storage/interface';
import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';

import { UserIdentity } from './pluginLoader';

const fileBlacklist = ['.DS_Store'];
const isValidFile = (file: string) => {
  return fileBlacklist.filter(badFile => badFile === file).length === 0;
};
class StorageService {
  private STORE_KEY = 'storageConnections';
  private storageConnections: StorageConnection[] = [];

  constructor() {
    this.storageConnections = Store.get(this.STORE_KEY);
    this.ensureDefaultBotFoldersExist();
  }

  public getStorageClient = (storageId: string, user?: UserIdentity): IFileStorage => {
    const conn = this.storageConnections.find(s => {
      return s.id === storageId;
    });
    if (conn === undefined) {
      throw new Error(`no storage connection with id ${storageId}`);
    }
    return StorageFactory.createStorageClient(conn, user);
  };

  public createStorageConnection = (connection: StorageConnection) => {
    // if id is already in store, skip it
    if (!this.storageConnections.find(item => item.id === connection.id)) {
      this.storageConnections.push(connection);
      Store.set(this.STORE_KEY, this.storageConnections);
    }
  };

  public getStorageConnections = (): StorageConnection[] => {
    const connections = this.storageConnections.map(s => {
      const temp = Object.assign({}, s);
      // if the last accessed path exist
      if (fs.existsSync(s.path)) {
        temp.path = Path.resolve(s.path); // resolve path if path is relative, and change it to unix pattern
      } else {
        temp.path = Path.resolve(s.defaultPath);
      }
      return temp;
    });
    this.ensureDefaultBotFoldersExist();
    return connections;
  };

  public checkBlob = async (storageId: string, filePath: string, user?: UserIdentity): Promise<boolean> => {
    const storageClient = this.getStorageClient(storageId, user);
    return await storageClient.exists(filePath);
  };

  public getBlobDateModified = async (storageId: string, filePath: string, user?: UserIdentity) => {
    const storageClient = this.getStorageClient(storageId, user);
    const stat = await storageClient.stat(filePath);
    return stat.lastModified;
  };

  // return connent for file
  // return children for dir
  public getBlob = async (storageId: string, filePath: string, user?: UserIdentity) => {
    const storageClient = this.getStorageClient(storageId, user);
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
  };

  public updateCurrentPath = (path: string, storageId: string) => {
    const storage = this.storageConnections.find(s => s.id === storageId);
    if (storage) {
      storage.path = path;
      Store.set(this.STORE_KEY, this.storageConnections);
    }
    return this.storageConnections;
  };

  private ensureDefaultBotFoldersExist = () => {
    this.storageConnections.forEach(s => {
      this.createFolderRecurively(s.defaultPath);
    });
  };

  private isBotFolder = async (storage: IFileStorage, path: string) => {
    // locate Main.dialog
    const mainPath = Path.join(path, 'Main', 'Main.dialog');
    const isbot = await storage.exists(mainPath);
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
          type: childStat.isDir ? ((await this.isBotFolder(storage, childAbsPath)) ? 'bot' : 'folder') : 'file',
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

  private createFolderRecurively = (path: string) => {
    if (!fs.existsSync(path)) {
      this.createFolderRecurively(Path.dirname(path));
      fs.mkdirSync(path);
    }
  };
}

const service = new StorageService();
export default service;
