// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import pluginLoader from '../../services/pluginLoader';

import { LocalDiskStorage } from './localDiskStorage';
import { StorageConnection, IFileStorage } from './interface';

export class StorageFactory {
  public static createStorageClient(conn: StorageConnection): IFileStorage {
    if (pluginLoader.extensions.storage && pluginLoader.extensions.storage.customStorageClass) {
      const customStorageClass = pluginLoader.extensions.storage.customStorageClass;
      if (customStorageClass) {
        return new customStorageClass(conn) as IFileStorage;
      }
    }

    // otherwise...
    return new LocalDiskStorage();
  }
}
