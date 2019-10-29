/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
