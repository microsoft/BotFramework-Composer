// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';

import log from '../logger';

import settings from './settings';

// overall the guidance in settings.json is to list every item in "development"
// section with a default value, and override the value for different environment
// in later sections

interface Settings {
  botAdminEndpoint: string;
  botEndpoint: string;
  assetsLibray: string;
  runtimeFolder: string;
  botsFolder: string;
}

const defaultSettings = settings.development;
const environment = process.env.NODE_ENV || 'development';
const environmentSettings = settings[environment];

const finalSettings = merge<Settings, Settings>(defaultSettings, environmentSettings);

log('App Settings: %O', finalSettings);

export default finalSettings;
