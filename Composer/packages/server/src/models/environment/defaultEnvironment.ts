import { IEnvironmentConfig, IEnvironment } from '.';
import { ISettingManager } from '../settings';
import { DefaultSettingManager } from '../settings/defaultSettingManager';
import { IBotConnector } from '../connector';
import { CSharpBotConnector } from '../connector/csharpBotConnector';

export class DefaultEnvironment implements IEnvironment {
  private config: IEnvironmentConfig;
  private settingManager: DefaultSettingManager;
  private botConnector: CSharpBotConnector;
  private defaultSlot: string = '';
  private slots: string[] = [''];

  public constructor(config: IEnvironmentConfig) {
    this.config = config;
    this.settingManager = new DefaultSettingManager(this.config.basePath);
    this.botConnector = new CSharpBotConnector(this.config.endpoint);
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
