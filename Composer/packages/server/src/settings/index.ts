// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import merge from 'lodash/merge';

import log from '../logger';
import { Path } from '../utility/path';

import { botsFolder, botEndpoint, appDataPath, environment } from './env';

interface Settings {
  botAdminEndpoint: string;
  botEndpoint: string;
  assetsLibray: string;
  runtimeFolder: string;
  botsFolder: string;
  appDataPath: string;
}

const envSettings: { [env: string]: Settings } = {
  development: {
    botAdminEndpoint: botEndpoint,
    botEndpoint: 'http://localhost:3979', //botEndpoint,
    assetsLibray: Path.resolve('./assets'),
    runtimeFolder: Path.resolve('../../../BotProject/Templates'),
    botsFolder: botsFolder || Path.join(os.homedir(), 'Documents', 'Composer'),
    appDataPath,
  },
};

const defaultSettings = envSettings.development;
const environmentSettings = envSettings[environment];

const finalSettings = merge<Settings, Settings>(defaultSettings, environmentSettings);

log('App Settings: %O', finalSettings);

export default finalSettings;
