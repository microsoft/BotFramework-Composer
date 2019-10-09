import { ISettingManager } from '../settings';
import { HostedSettingManager } from '../settings/hostedSettingManager';
import { IBotConnector } from '../connector';
import { SelfHostBotConnector } from '../connector/selfHostConnector';

import { IEnvironmentConfig, IEnvironment } from '.';

export class HostedEnvironment implements IEnvironment {
  private config: IEnvironmentConfig;
  private settingManager: HostedSettingManager;
  private botConnector: SelfHostBotConnector;
  private defaultSlot: string = 'integration';
  private slots: string[] = ['integration', 'production'];

  constructor(config: IEnvironmentConfig, skipLoad?: boolean) {
    this.config = config;
    this.settingManager = new HostedSettingManager(this.config.basePath);
    this.botConnector = new SelfHostBotConnector(skipLoad);
  }

  public getEnvironmentName(projectName: string): string | undefined {
    return projectName;
  }

  public getDefaultSlot(): string {
    return this.defaultSlot;
  }

  public getSlotNames(): string[] {
    return this.slots;
  }

  public getSettingsManager(): ISettingManager {
    return this.settingManager;
  }

  public getBotConnector(): IBotConnector {
    return this.botConnector;
  }
}
