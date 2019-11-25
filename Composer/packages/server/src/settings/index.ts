// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';

import log from '../logger';

import settings from './settings';
import * as env from './env';

// overall the guidance in settings.json is to list every item in "development"
// section with a default value, and override the value for different environment
// in later sections

const defaultSettings = settings.development;
const environment = process.env.NODE_ENV || 'development';
const environmentSettings = settings[environment];

const finalSettings = merge(defaultSettings, environmentSettings, env);

log('App Settings: %O', finalSettings);

export default finalSettings;
