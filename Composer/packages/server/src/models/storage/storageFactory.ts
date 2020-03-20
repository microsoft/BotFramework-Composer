// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { pluginLoader, UserIdentity } from '../../services/pluginLoader';

import { LocalDiskStorage } from './localDiskStorage';
import { StorageConnection, IFileStorage } from './interface';

export class StorageFactory {
  public static createStorageClient(conn: StorageConnection, user?: UserIdentity): IFileStorage {
    if (pluginLoader.extensions.storage && pluginLoader.extensions.storage.customStorageClass) {
      const customStorageClass = pluginLoader.extensions.storage.customStorageClass;
      if (customStorageClass) {
        return new customStorageClass(conn, user) as IFileStorage;
      }
    }

    // otherwise...
    return new LocalDiskStorage();
  }
}
