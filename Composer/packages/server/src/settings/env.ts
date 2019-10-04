import settings from './settings';
import { IEnvironmentConfig } from '../models/environment';

export const absHosted = !!process.env.PUBLIC_URL;
export const absHostRoot = process.env.WEBSITE_HOSTNAME
  ? `https://${process.env.WEBSITE_HOSTNAME}`
  : 'http://localhost:3978';

export const absHostedConfig: IEnvironmentConfig = {
  name: 'absh',
  basePath: '',
  endpoint: '',
};

export const defaultConfig: IEnvironmentConfig = {
  name: 'default',
  basePath: '',
  endpoint: settings.botRuntime,
};

export const currentConfig: IEnvironmentConfig = absHosted ? absHostedConfig : defaultConfig;
