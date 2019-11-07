// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import os from 'os';

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: path.resolve(__dirname, '../../../../../MyBots'),
      defaultPath: path.join(os.homedir(), 'Documents', 'Composer'),
    },
  ],
  recentBotProjects: [],
};
