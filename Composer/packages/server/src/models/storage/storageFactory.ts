// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from '@bfc/extension';

import { ExtensionContext } from '../extension/extensionContext';
import { BotProjectMetadata } from '../../services/project';

import { LocalDiskStorage } from './localDiskStorage';
import { StorageConnection, IFileStorage } from './interface';

export class StorageFactory {
  public static createStorageClient(
    conn: StorageConnection,
    user?: UserIdentity,
    id?: string,
    metadata?: BotProjectMetadata
  ): IFileStorage {
    if (ExtensionContext.extensions.storage && ExtensionContext.extensions.storage.customStorageClass) {
      const customStorageClass = ExtensionContext.extensions.storage.customStorageClass;
      if (customStorageClass) {
        return new customStorageClass(conn, user, id, metadata) as IFileStorage;
      }
    }

    // otherwise...
    return new LocalDiskStorage();
  }
}
