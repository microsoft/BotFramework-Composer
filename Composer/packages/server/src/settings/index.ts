// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import merge from 'lodash/merge';

import log from '../logger';

import { botsFolder, botEndpoint, appDataPath, environment, runtimeFrameworkVersion, platform, diskNames } from './env';

interface Settings {
  botAdminEndpoint: string;
  botEndpoint: string;
  runtimeFrameworkVersion: string;
  botsFolder: string;
  appDataPath: string;
  platform: string;
  diskNames: string[];
}

const envSettings: { [env: string]: Settings } = {
  development: {
    botAdminEndpoint: botEndpoint,
    botEndpoint: botEndpoint,
    botsFolder: botsFolder || os.homedir(),
    runtimeFrameworkVersion,
    appDataPath,
    platform,
    diskNames,
  },
};

const defaultSettings = envSettings.development;
const environmentSettings = envSettings[environment];

const finalSettings = merge<Settings, Settings>(defaultSettings, environmentSettings);

log('App Settings: %O', finalSettings);

export default finalSettings;
