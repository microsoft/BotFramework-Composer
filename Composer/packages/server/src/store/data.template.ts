// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: path.resolve(__dirname, '../../../../../MyBots'),
    },
  ],
  recentBotProjects: [],
};
