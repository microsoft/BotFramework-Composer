// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
