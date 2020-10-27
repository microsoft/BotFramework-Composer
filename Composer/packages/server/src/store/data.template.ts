// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultFeatureFlags } from '@bfc/shared';

import settings from '../settings';

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
  ],
  recentBotProjects: [],
  projectLocationMap: {},
  featureFlags: getDefaultFeatureFlags(),
};
