// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import merge from 'lodash/merge';

import log from '../logger';
import { Path } from '../utility/path';

import { botsFolder, botEndpoint, appDataPath, environment, runtimeFolder } from './env';

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
    assetsLibray: Path.resolve(__dirname, '../../assets'),
    botsFolder: botsFolder || Path.join(os.homedir(), 'Documents', 'Composer'),
    runtimeFolder,
    appDataPath,
  },
};

const defaultSettings = envSettings.development;
const environmentSettings = envSettings[environment];

const finalSettings = merge<Settings, Settings>(defaultSettings, environmentSettings);

log('App Settings: %O', finalSettings);

export default finalSettings;
