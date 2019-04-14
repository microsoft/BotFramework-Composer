import { StorageConnection, IFileStorage } from '../models/storage/interface';
import { StorageFactory } from '../models/storage/storageFactory';
import { Store } from '../store/store';
import path from 'path';

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
      let temp = Object.assign({}, s);
      temp.path = path.resolve(s.path); // resolve path if path is relative
      return temp;
    });
  };

  public checkBlob = (storageId: string, filePath: string): boolean => {
    const connection = this.storageConnections.filter(c => c.id === storageId)[0];
    const storageClient = StorageFactory.createStorageClient(connection);
    return storageClient.existSync(filePath);
  };

  // return connent for file
  // return children for dir
  public getBlob = (storageId: string, filePath: string) => {
    const connection = this.storageConnections.filter(c => c.id === storageId)[0];
    const storageClient = StorageFactory.createStorageClient(connection);

    const stat = storageClient.statSync(filePath);
    if (stat.isFile) {
      // NOTE: this should NOT parse the content, just to keep the previous behavior
      return JSON.parse(storageClient.readFileSync(filePath));
    } else {
      return {
        name: path.basename(filePath),
        parent: path.dirname(filePath),
        children: this.getChildren(storageClient, filePath),
      };
    }
  };

  private getChildren = (storage: IFileStorage, dirPath: string) => {
    // TODO: filter files, folder which have no read and write
    let children = storage.readDirSync(dirPath).map(childName => {
      const childAbsPath = path.join(dirPath, childName);
      const childStat = storage.statSync(childAbsPath);

      return {
        name: childName,
        type: childStat.isDir ? 'folder' : 'file',
        path: childAbsPath,
        lastModified: 0, // just keep the previous interface
        size: 0, // just keep the previous interface
      };
    });

    return children;
  };
}

const service = new StorageService();
export default service;
