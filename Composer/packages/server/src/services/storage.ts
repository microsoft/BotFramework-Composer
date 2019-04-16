import path from 'path';

import { StorageConnection, IFileStorage } from '../models/storage/interface';
import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';

class StorageService {
  private STORE_KEY = 'storageConnections';
  private storageConnections: StorageConnection[] = [];

  constructor() {
    this.storageConnections = Store.get(this.STORE_KEY);
  }

  public createStorageConnection = (connection: StorageConnection) => {
    this.storageConnections.push(connection);
    Store.set(this.STORE_KEY, this.storageConnections);
  };

  public getStorageConnections = (): StorageConnection[] => {
    return this.storageConnections.map(s => {
      const temp = Object.assign({}, s);
      temp.path = path.resolve(s.path); // resolve path if path is relative
      return temp;
    });
  };

  public checkBlob = async (storageId: string, filePath: string): Promise<boolean> => {
    const connection = this.storageConnections.filter(c => c.id === storageId)[0];
    const storageClient = StorageFactory.createStorageClient(connection);
    return await storageClient.exists(filePath);
  };

  // return connent for file
  // return children for dir
  public getBlob = async (storageId: string, filePath: string) => {
    const connection = this.storageConnections.find(c => c.id === storageId);
    if (connection === undefined) {
      throw new Error(`no storage connection with id ${storageId}`);
    }
    const storageClient = StorageFactory.createStorageClient(connection);

    const stat = await storageClient.stat(filePath);
    if (stat.isFile) {
      // NOTE: this behavior is not correct, we should NOT parse this file as json
      // becase it might not be json, this api is a more general file api than json file
      // didn't fix it because this is the previous behavior
      // TODO: fix this behavior and the upper layer interface accordingly
      return JSON.parse(await storageClient.readFile(filePath));
    } else {
      return {
        name: path.basename(filePath),
        parent: path.dirname(filePath),
        children: await this.getChildren(storageClient, filePath),
      };
    }
  };

  private getChildren = async (storage: IFileStorage, dirPath: string) => {
    // TODO: filter files, folder which have no read and write
    const children = (await storage.readDir(dirPath)).map(async childName => {
      const childAbsPath = path.join(dirPath, childName);
      const childStat = await storage.stat(childAbsPath);

      return {
        name: childName,
        type: childStat.isDir ? 'folder' : 'file',
        path: childAbsPath,
        lastModified: 0, // just keep the previous interface
        size: 0, // just keep the previous interface
      };
    });

    return await Promise.all(children);
  };
}

const service = new StorageService();
export default service;
