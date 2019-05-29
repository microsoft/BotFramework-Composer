import { merge } from 'lodash';

import settings from './settings.json';

// overall the guidance in settings.json is to list every item in "development"
// section with a default value, and override the value for different environment
// in later sections

// eslint-disable-next-line no-console
console.log(`process env NODE_ENV is ${process.env.NODE_ENV}`);
const defaultSettings = settings.development;
const environment = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const environmentSettings = (settings as any)[environment];

const finalSettings = merge(defaultSettings, environmentSettings);

export default finalSettings;
