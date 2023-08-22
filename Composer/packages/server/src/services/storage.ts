// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from '@bfc/extension';

import { Path } from '../utility/path';
import { StorageConnection, IFileStorage } from '../models/storage/interface';
import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';
import settings from '../settings';

const fileBlacklist = ['.DS_Store'];
const isValidFile = (file: string) => {
  return fileBlacklist.filter((badFile) => badFile === file).length === 0;
};
class StorageService {
  private STORE_KEY = 'storageConnections' as const;
  private storageConnections: StorageConnection[] = [];

  constructor() {
    console.log('in storage constructor');
    this.storageConnections = Store.get(this.STORE_KEY, []);
    console.log('finished storage constructor. connections are ' + JSON.stringify(this.storageConnections));
    // this.ensureDefaultBotFoldersExist();
  }

  public getStorageClient = (storageId: string, user?: UserIdentity): IFileStorage => {
    const conn = this.storageConnections.find((s) => {
      return s.id === storageId;
    });
    if (conn === undefined) {
      throw new Error(`no storage connection with id ${storageId}`);
    }
    return StorageFactory.createStorageClient(conn, user);
  };

  public createStorageConnection = (connection: StorageConnection) => {
    // if id is already in store, skip it
    if (!this.storageConnections.find((item) => item.id === connection.id)) {
      this.storageConnections.push(connection);
      Store.set(this.STORE_KEY, this.storageConnections);
    }
  };

  public getStorageConnections = (user?: UserIdentity): StorageConnection[] => {
    const connections = this.storageConnections.map((s) => {
      const storageClient = StorageFactory.createStorageClient(s, user);
      const temp = Object.assign({}, s);
      // if the last accessed path exist
      if (storageClient.existsSync(s.path)) {
        temp.path = s.path; // resolve path if path is relative, and change it to unix pattern
      } else {
        temp.path = s.defaultPath;
      }
      return temp;
    });
    this.ensureDefaultBotFoldersExist(user);
    return connections;
  };

  public checkBlob = async (storageId: string, filePath: string, user?: UserIdentity): Promise<boolean> => {
    console.log('checking blob at ' + filePath + ' for user ' + JSON.stringify(user));
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
    if (filePath === '/' && settings.platform === 'win32') {
      console.log('in the shortcut');
      return {
        name: '',
        parent: '/',
        children: settings.diskNames.map((d) => {
          return {
            name: d,
            type: 'folder',
            path: d,
            writable: true,
          };
        }),
        writable: false,
      };
    }
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
        writable: stat.isWritable,
      };
    }
  };

  public updateCurrentPath = (path: string, storageId: string) => {
    console.log('updating path to ' + path);
    //A path in windows should never start with \, but the fs.existsSync() return true
    if (path?.startsWith('\\') && settings.platform === 'win32') {
      console.log('path starts with backslash, cancelling');
      return this.storageConnections;
    }
    if (path?.endsWith(':')) {
      path = path + '/';
    }
    const storage = this.storageConnections.find((s) => s.id === storageId);
    if (storage) {
      storage.path = path;
      Store.set(this.STORE_KEY, this.storageConnections);
    }
    return this.storageConnections;
  };

  public validatePath = async (storageId: string, path: string, user?: UserIdentity) => {
    const storageClient = this.getStorageClient(storageId, user);
    if (!(await storageClient.exists(path))) {
      return 'The path does not exist';
    } else if (!(await storageClient.stat(path)).isDir) {
      return 'This is not a directory';
    } else {
      return '';
    }
  };

  public createFolder = (storageId: string, path: string, user?: UserIdentity) => {
    const storageClient = this.getStorageClient(storageId, user);
    if (!storageClient.existsSync(path)) {
      storageClient.mkDirSync(path);
    }
  };

  public updateFolder = async (
    storageId: string,
    path: string,
    oldName: string,
    newName: string,
    user?: UserIdentity
  ) => {
    const currentPath = Path.join(path, oldName);
    const newPath = Path.join(path, newName);
    const storageClient = this.getStorageClient(storageId, user);
    if (storageClient.existsSync(currentPath)) {
      await storageClient.rename(currentPath, newPath);
    } else {
      throw new Error(`The folder ${currentPath} does not exist`);
    }
  };

  public checkIsBotFolder = async (storageId: string, path: string, user?: UserIdentity) => {
    const storageClient = this.getStorageClient(storageId, user);
    return await this.isBotFolder(storageClient, path);
  };

  private ensureDefaultBotFoldersExist = (user?: UserIdentity) => {
    this.storageConnections.forEach((s) => {
      const client = StorageFactory.createStorageClient(s, user);
      this.createFolderRecursively(s.defaultPath, client);
    });
  };

  private isBotFolder = async (storage: IFileStorage, path: string) => {
    // locate new structure bot:
    const children = await storage.readDir(path);
    const dialogFile = /.+(\.)dialog$/;
    const isNewBot = children.some((name) => dialogFile.test(name));
    // locate old structure bot: Main.dialog
    const mainPath = Path.join(path, 'Main', 'Main.dialog');
    const isOldBot = await storage.exists(mainPath);
    return isNewBot || isOldBot;
  };

  private getChildren = async (storage: IFileStorage, dirPath: string) => {
    // TODO: filter files, folder which have no read and write
    console.log('getting children');
    const children = (
      await (await storage.readDir(dirPath)).filter((childName) => {
        console.log('found child ' + childName);
        const regex = /^[.$]/;
        return !regex.test(childName);
      })
    ).map(async (childName) => {
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
    return result.filter((item) => !!item);
  };

  private createFolderRecursively = (path: string, conn: IFileStorage) => {
    if (!conn.existsSync(path)) {
      this.createFolderRecursively(Path.dirname(path), conn);
      conn.mkDirSync(path);
    }
  };
}

const service = new StorageService();
export default service;
