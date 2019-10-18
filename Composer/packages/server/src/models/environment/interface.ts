import { ISettingManager } from '../settings';
import { IBotConnector } from '../connector';
import { absHosted } from '../../settings/env';
import settings from '../../settings/settings';

export interface IEnvironmentConfig {
  name: string;
  basePath: string;
  adminEndpoint: string;
  endpoint: string;
}

export interface IEnvironment {
  getEnvironmentName(projectName: string): string | undefined;
  getSlotNames(): string[];
  getDefaultSlot(): string;
  getSettingsManager(): ISettingManager;
  getBotConnector(): IBotConnector;
}

export const absHostedConfig: IEnvironmentConfig = {
  name: 'absh',
  basePath: '',
  adminEndpoint: '',
  endpoint: '',
};

export const mockHostedConfig: IEnvironmentConfig = {
  name: 'mockhosted',
  basePath: '',
  adminEndpoint: '',
  endpoint: '',
};

export const defaultConfig: IEnvironmentConfig = {
  name: 'default',
  basePath: '',
  adminEndpoint: settings.botAdminEndpoint,
  endpoint: settings.botEndpoint,
};

export const currentConfig: IEnvironmentConfig = absHosted
  ? absHostedConfig
  : process.env.MOCKHOSTED
  ? mockHostedConfig
  : defaultConfig;
