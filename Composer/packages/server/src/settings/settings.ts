// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';
import fs from 'fs';

import log from '../logger';
import { Path } from '../utility/path';

import { botsFolder } from './env';

let defaultPath = botsFolder;

if (!defaultPath || !fs.existsSync(defaultPath)) {
  log(`The bots folder is set to ${Path.join(os.homedir(), 'Documents', 'Composer')}`);
  defaultPath = Path.join(os.homedir(), 'Documents', 'Composer');
}

export default {
  development: {
    botAdminEndpoint: 'http://localhost:3979',
    botEndpoint: 'http://localhost:3979',
    assetsLibray: Path.resolve('./assets'),
    runtimeFolder: Path.resolve('../../../BotProject/Templates'),
    botsFolder: defaultPath,
  },
  container: {
    botAdminEndpoint: 'http://botruntime:80',
  },
};
