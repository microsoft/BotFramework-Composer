// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import { Path } from '../utility/path';

import { botsFolder, botEndpoint } from './env';

export default {
  development: {
    botAdminEndpoint: botEndpoint,
    botEndpoint: botEndpoint,
    assetsLibray: Path.resolve('./assets'),
    runtimeFolder: Path.resolve('../../../BotProject/Templates'),
    botsFolder: botsFolder || Path.join(os.homedir(), 'Documents', 'Composer'),
  },
};
