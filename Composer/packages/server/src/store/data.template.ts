// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';
import fs from 'fs';

import { Path } from '../utility/path';
let defaultPath = process.env.DEFAULT_PATH ? Path.resolve(process.env.DEFAULT_PATH) : process.env.DEFAULT_PATH;
console.log(process.env.DEFAULT_PATH);
console.log(defaultPath);
if (!defaultPath) {
  console.log(`The default path is set to ${Path.join(os.homedir(), 'Documents', 'Composer')}`);
  defaultPath = Path.join(os.homedir(), 'Documents', 'Composer');
} else if (!fs.existsSync(defaultPath)) {
  console.log(
    `The default path ${defaultPath} does not exist. We set it to ${Path.join(os.homedir(), 'Documents', 'Composer')}`
  );
  defaultPath = Path.join(os.homedir(), 'Documents', 'Composer');
}
console.log(defaultPath);
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
