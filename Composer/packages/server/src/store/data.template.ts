// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import settings from '../settings';

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: '', // this is used as last accessed path, if it is invalid, use defaultPath
      defaultPath: settings.botsFolder,
    },
  ],
  recentBotProjects: [],
  projectLocationMap: {},
};
