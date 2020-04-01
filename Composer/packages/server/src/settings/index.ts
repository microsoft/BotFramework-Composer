// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import os from 'os';

import merge from 'lodash/merge';

import log from '../logger';
import { Path } from '../utility/path';

import {
  botsFolder,
  botEndpoint,
  appDataPath,
  environment,
  runtimeFolder,
  runtimeFrameworkVersion,
  platform,
  diskNames,
} from './env';

interface Settings {
  botAdminEndpoint: string;
  botEndpoint: string;
  assetsLibray: string;
  runtimeFolder: string;
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
    assetsLibray: Path.resolve(__dirname, '../../assets'),
    botsFolder: botsFolder || Path.join(os.homedir(), 'Documents', 'Composer'),
    runtimeFolder,
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
