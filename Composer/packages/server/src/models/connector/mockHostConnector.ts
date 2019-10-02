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

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';
    this.history.integration = this.createIntegrationVersion(user);
  };

  public getEditingStatus = async (): Promise<boolean> => {
    return false;
  };

  public getPublishHistory = async (): Promise<IPublishHistory> => {
    return this.history;
  };

  public publish = async (config: BotConfig, label: string) => {
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';

    if (!label) {
      // make a new mock and updatre history
      this.history.previousProduction = this.history.production;
      this.history.production = this.createPublishVersion(user);
    } else if (this.history.previousProduction && label === this.history.previousProduction.label) {
      // rollback
      this.history.production = this.history.previousProduction;
      this.history.production.publishTimestamp = new Date();

      // can't rollback twice
      this.history.previousProduction = undefined;
    } else {
      throw new Error('Could not publish. Label not found.');
    }
  };

  private createPublishVersion(user: string): IPublishVersion {
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

  private createIntegrationVersion(user: string): IPublishVersion {
    const timestamp = new Date();
    const datetimeStamp = timestamp.toISOString().replace(/:/g, '.');
    const tag = `integration_${datetimeStamp}`;
    let version = this.createPublishVersion(user);
    version.label = tag;
    return version;
  }
}
