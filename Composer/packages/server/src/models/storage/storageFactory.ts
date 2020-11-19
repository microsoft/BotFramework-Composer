// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from '@bfc/extension';

import { ExtensionContext } from '../extension/extensionContext';

import { LocalDiskStorage } from './localDiskStorage';
import { StorageConnection, IFileStorage } from './interface';

export class StorageFactory {
  public static createStorageClient(conn: StorageConnection, user?: UserIdentity): IFileStorage {
    if (ExtensionContext.extensions.storage && ExtensionContext.extensions.storage.customStorageClass) {
      const customStorageClass = ExtensionContext.extensions.storage.customStorageClass;
      if (customStorageClass) {
        return new customStorageClass(conn, user) as IFileStorage;
      }
    }

    // otherwise...
    return new LocalDiskStorage();
  }
}
