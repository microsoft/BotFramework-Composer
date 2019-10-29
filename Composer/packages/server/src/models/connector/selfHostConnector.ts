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
//eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
import { resolve } from 'path';

import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';
import { MockHostBotConnector } from './mockHostConnector';

export class SelfHostBotConnector implements IBotConnector {
  constructor(skipLoad?: boolean) {
    if (!skipLoad) {
      // for production
      this.buildAsync = require('commands/build').handlerAsync;
      this.publishAsync = require('commands/publish').handlerAsync;
      this.getEditingStatusAsync = require('commands/editingStatus').handlerAsync;
      this.getPublishHistoryAsync = require('commands/getPublishHistory').handlerAsync;
    } else {
      // for testing this class
      this.buildAsync = async () => {
        return Promise.resolve('done');
      };
      this.publishAsync = async () => {
        return Promise.resolve('done');
      };
      this.getEditingStatusAsync = async () => {
        return Promise.resolve({ hasChanges: false });
      };
      this.getPublishHistoryAsync = async () => {
        return Promise.resolve({
          production: MockHostBotConnector.createPublishVersion(''),
          previousProduction: undefined,
          integration: MockHostBotConnector.createIntegrationVersion(''),
        });
      };
    }
  }

  private buildAsync: SelfHostCommands.Build;
  private publishAsync: SelfHostCommands.Publish;
  private getEditingStatusAsync: SelfHostCommands.GetEditingStatus;
  private getPublishHistoryAsync: SelfHostCommands.GetPublishHistory;
  public status: BotStatus = BotStatus.NotConnected;

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const { targetEnvironment: env } = config;
    const user = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.name] : 'unknown_user';
    const userEmail = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.upn] : undefined;
    const accessToken = config.user ? config.user.accessToken : undefined;
    await this.buildAsync({
      user,
      userEmail,
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      env: env && env !== 'editing' ? env : 'integration',
      botId: undefined,
      accessToken,
    });
  };

  public getEditingStatus = async (): Promise<boolean> => {
    const status = await this.getEditingStatusAsync({
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
    return status ? status.hasChanges : false;
  };

  public getPublishHistory = async (): Promise<IPublishHistory> => {
    return await this.getPublishHistoryAsync({
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
    });
  };

  public publish = async (config: BotConfig, label: string | undefined) => {
    const user = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.name] : 'unknown_user';
    const userEmail = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.upn] : undefined;
    const accessToken = config.user ? config.user.accessToken : undefined;
    await this.publishAsync({
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dest: resolve(process.env.HOME!, 'site/artifacts/bot'),
      user,
      userEmail,
      label,
      accessToken,
      botId: undefined, // taken from the access token
    });
  };
}
