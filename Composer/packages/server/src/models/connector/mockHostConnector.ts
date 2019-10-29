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
import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory, IPublishVersion } from './interface';

export class MockHostBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;
  private history: IPublishHistory = {
    production: undefined,
    previousProduction: undefined,
    integration: undefined,
  };

  constructor() {
    const config: BotConfig = {
      user: { accessToken: '123' },
      MicrosoftAppId: '123',
      MicrosoftAppPassword: '123',
      luis: {
        name: '123',
        authoringKey: '1232',
        authoringRegion: '123',
        endpointKey: '123',
        defaultLanguage: 'en',
        environment: 'dev',
      },
    };

    this.sync(config).then(() => {
      this.publish(config);
    });
  }

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const user = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.name] : 'unknown_user';
    this.history.integration = MockHostBotConnector.createIntegrationVersion(user);
    return Promise.resolve();
  };

  public getEditingStatus = async (): Promise<boolean> => {
    return Promise.resolve(false);
  };

  public getPublishHistory = async (): Promise<IPublishHistory> => {
    return Promise.resolve(this.history);
  };

  public publish = async (config: BotConfig, label?: string) => {
    const user = config.user && config.user.decodedToken ? config.user.decodedToken[ClaimNames.name] : 'unknown_user';

    if (!label) {
      // make a new mock and updatre history
      this.history.previousProduction = this.history.production;
      this.history.production = MockHostBotConnector.createPublishVersion(user);
    } else if (this.history.previousProduction && label === this.history.previousProduction.label) {
      // rollback
      this.history.production = this.history.previousProduction;
      this.history.production.publishTimestamp = new Date();

      // can't rollback twice
      this.history.previousProduction = undefined;
      return Promise.resolve();
    } else {
      throw new Error('Could not publish. Label not found.');
    }
  };

  public static createPublishVersion(user: string): IPublishVersion {
    const timestamp = new Date();
    const datetimeStamp = timestamp.toISOString().replace(/:/g, '.');
    const tag = `production_${datetimeStamp}`;

    return {
      publishTimestamp: timestamp,
      buildTimestamp: timestamp,
      user: user,
      userEmail: '',
      label: tag,
    };
  }

  public static createIntegrationVersion(user: string): IPublishVersion {
    const timestamp = new Date();
    const datetimeStamp = timestamp.toISOString().replace(/:/g, '.');
    const tag = `integration_${datetimeStamp}`;
    const version = this.createPublishVersion(user);
    version.label = tag;
    return version;
  }
}
