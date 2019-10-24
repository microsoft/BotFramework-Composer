import { resolve } from 'path';

import { ISettingManager } from '../settings';
import { HostedSettingManager } from '../settings/hostedSettingManager';
import { IBotConnector } from '../connector';
import { SelfHostBotConnector } from '../connector/selfHostConnector';

import { IEnvironmentConfig, IEnvironment } from '.';

export class HostedEnvironment implements IEnvironment {
  private settingManager: HostedSettingManager;
  private botConnector: SelfHostBotConnector;
  private defaultSlot = 'integration';
  private slots: string[] = ['integration', 'production'];

  constructor(_: IEnvironmentConfig, skipLoad?: boolean) {
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const botRootPath = resolve(process.env.HOME!, 'site/artifacts/bot');
    this.settingManager = new HostedSettingManager(botRootPath);
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
