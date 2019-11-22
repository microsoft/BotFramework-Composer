// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import os from 'os';
import fs from 'fs';
let defaultPath = process.env.DEFAULT_PATH ? path.resolve(process.env.DEFAULT_PATH) : process.env.DEFAULT_PATH;
if (!defaultPath) {
  console.log(`The default path is set to ${path.join(os.homedir(), 'Documents', 'Composer')}`);
  defaultPath = path.join(os.homedir(), 'Documents', 'Composer');
} else if (!fs.existsSync(defaultPath)) {
  console.log(
    `The default path ${defaultPath} does not exist. We set it to ${path.join(os.homedir(), 'Documents', 'Composer')}`
  );
  defaultPath = path.join(os.homedir(), 'Documents', 'Composer');
}
export default {
  storageConnections: [
    {
      id: 'default',
      name: 'This PC',
      type: 'LocalDisk',
      path: '', // this is used as last accessed path, if it is invalid, use defaultPath
      defaultPath,
    },
  ],
  recentBotProjects: [],
};
