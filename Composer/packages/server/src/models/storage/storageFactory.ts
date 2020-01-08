// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MongoStorage } from '../../../../../plugins/mongostorage';

import { StorageConnection, IFileStorage } from './interface';
// import { LocalDiskStorage } from './localDiskStorage';
import { AzureBlobStorage } from './azureBlobStorage';

export class StorageFactory {
  public static createStorageClient(conn: StorageConnection): IFileStorage {
    switch (conn.type) {
      case 'LocalDisk':
        return new MongoStorage(conn);
      // return new LocalDiskStorage();
      case 'AzureBlobStorage':
        return new AzureBlobStorage(conn);
      default:
        throw new Error(`unknow storage type ${conn.type}`);
    }
  }
}
