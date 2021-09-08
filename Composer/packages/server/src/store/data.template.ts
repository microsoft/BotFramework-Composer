// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultFeatureFlags, ServerSettings } from '@bfc/shared';

import settings from '../settings';
import { LocationRef } from '../models/bot/interface';
import { StorageConnection } from '../models/storage/interface';
import { BotProjectMetadata } from '../services/project';

export default {
  version: 1,
  customTemplateFeedUrl: '',
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
  projectLocationMap: {} as Record<string, BotProjectMetadata>,
  featureFlags: getDefaultFeatureFlags(),
  settings: {
    telemetry: {},
  } as ServerSettings,
};
