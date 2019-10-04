import { ISettingManager } from '../settings';
import { IBotConnector } from '../connector';

export interface IEnvironmentConfig {
  name: string;
  basePath: string;
  endpoint: string;
}

export interface IEnvironment {
  getEnvironmentName(projectName: string): string | undefined;
  getSlotNames(): string[];
  getDefaultSlot(): string;
  getSettingsManager(): ISettingManager;
  getBotConnector(): IBotConnector;
}
