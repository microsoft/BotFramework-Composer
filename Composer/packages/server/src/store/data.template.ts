// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultFeatureFlags } from '@bfc/shared';

import settings from '../settings';
import { LocationRef } from '../models/bot/interface';
import { StorageConnection } from '../models/storage/interface';

export default {
  version: 1,
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: '', // this is used as last accessed path, if it is invalid, use defaultPath
      platform: settings.platform,
      defaultPath: settings.botsFolder,
    },
  ] as StorageConnection[],
  recentBotProjects: [] as LocationRef[],
  projectLocationMap: {} as Record<string, string>,
  featureFlags: getDefaultFeatureFlags(),
};
