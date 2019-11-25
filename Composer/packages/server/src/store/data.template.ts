// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import log from '../logger';
import settings from '../settings';
import { Path } from '../utility/path';

let defaultPath = settings.botsFolder;
if (defaultPath && defaultPath.endsWith(':')) {
  defaultPath = defaultPath + '/';
}
if (!defaultPath) {
  log(`The default path is set to ${settings.defaultFolder}`);
  defaultPath = settings.defaultFolder;
} else if (!fs.existsSync(defaultPath)) {
  log(`The default path ${defaultPath} does not exist. We set it to ${settings.defaultFolder}`);
  defaultPath = settings.defaultFolder;
}
defaultPath = Path.resolve(defaultPath);

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
