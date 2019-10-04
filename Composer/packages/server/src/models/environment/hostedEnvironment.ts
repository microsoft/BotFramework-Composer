import { IEnvironmentConfig, IEnvironment } from '.';
import { ISettingManager } from '../settings';
import { HostedSettingManager } from '../settings/hostedSettingManager';
import { IBotConnector } from '../connector';
import { SelfHostBotConnector } from '../connector/selfHostConnector';

export class HostedEnvironment implements IEnvironment {
  private config: IEnvironmentConfig;
  private settingManager: HostedSettingManager;
  private botConnector: SelfHostBotConnector;
  private defaultSlot: string = 'integration';
  private slots: string[] = ['integration', 'production'];

  constructor(config: IEnvironmentConfig) {
    this.config = config;
    this.settingManager = new HostedSettingManager(this.config.basePath);
    this.botConnector = new SelfHostBotConnector();
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
