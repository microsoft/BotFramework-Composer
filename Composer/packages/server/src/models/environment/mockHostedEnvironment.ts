import { ISettingManager } from '../settings';
import { HostedSettingManager } from '../settings/hostedSettingManager';
import { IBotConnector } from '../connector';
import { MockHostBotConnector } from '../connector/mockHostConnector';

import { IEnvironmentConfig, IEnvironment } from '.';

export class MockHostedEnvironment implements IEnvironment {
  private config: IEnvironmentConfig;
  private settingManager: HostedSettingManager;
  private botConnector: MockHostBotConnector;
  private defaultSlot: string = 'integration';
  private slots: string[] = ['integration', 'production'];

  constructor(config: IEnvironmentConfig) {
    this.config = config;
    this.settingManager = new HostedSettingManager(this.config.basePath);
    this.botConnector = new MockHostBotConnector();
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
