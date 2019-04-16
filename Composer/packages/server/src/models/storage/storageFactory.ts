import { StorageConnection, IFileStorage } from './interface';
import { LocalDiskStorage } from './localDiskStorage';

export class StorageFactory {
  public static createStorageClient(conn: StorageConnection): IFileStorage {
    switch (conn.type) {
      case 'LocalDisk':
        return new LocalDiskStorage();
      default:
        throw new Error(`unknow storage type ${conn.type}`);
    }
  }
}
