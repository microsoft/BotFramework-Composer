// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import { Path } from '../utility/path';

export default {
  development: {
    botAdminEndpoint: 'http://localhost:3979',
    botEndpoint: 'http://localhost:3979',
    assetsLibray: './assets',
    runtimeFolder: '../../../BotProject/Templates',
    defaultFolder: Path.join(os.homedir(), 'Documents', 'Composer'),
  },
  container: {
    botAdminEndpoint: 'http://botruntime:80',
  },
};
