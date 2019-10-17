import { resolve } from 'path';

import { ISettingManager } from '../settings';
import { HostedSettingManager } from '../settings/hostedSettingManager';
import { IBotConnector } from '../connector';
import { MockHostBotConnector } from '../connector/mockHostConnector';

import { IEnvironmentConfig, IEnvironment } from '.';

export class MockHostedEnvironment implements IEnvironment {
  private settingManager: HostedSettingManager;
  private botConnector: MockHostBotConnector;
  private defaultSlot = 'integration';
  private slots: string[] = ['integration', 'production'];

  constructor(_: IEnvironmentConfig) {
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const botRootPath = resolve(process.env.HOME!, 'site/artifacts/bot');
    this.settingManager = new HostedSettingManager(botRootPath);
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
