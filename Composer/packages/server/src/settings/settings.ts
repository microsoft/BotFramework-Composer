// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import { Path } from '../utility/path';

import { botsFolder } from './env';

export default {
  development: {
    botAdminEndpoint: 'http://localhost:3979',
    botEndpoint: 'http://localhost:3979',
    assetsLibray: Path.resolve('./assets'),
    runtimeFolder: Path.resolve('../../../BotProject/Templates'),
    botsFolder: botsFolder || Path.join(os.homedir(), 'Documents', 'Composer'),
  },
  container: {
    botAdminEndpoint: 'http://botruntime:80',
  },
};
