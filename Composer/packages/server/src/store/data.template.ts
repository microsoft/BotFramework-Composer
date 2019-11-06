// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import os from 'os';

let defaultPath = '';
console.log(os.platform());
switch (os.platform()) {
  case 'win32':
    defaultPath = path.join(os.homedir(), 'Documents', 'Composer');
    break;
  case 'darwin':
    defaultPath = path.join(os.homedir(), 'Documents', 'Composer');
    break;
  default:
    defaultPath = path.join(os.homedir(), 'Documents', 'Composer');
    break;
}

export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: path.resolve(__dirname, '../../../../../MyBots'),
      defaultPath,
    },
  ],
  recentBotProjects: [],
};
