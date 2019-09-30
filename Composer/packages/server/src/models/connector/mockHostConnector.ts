import { ClaimNames } from '../../constants';
import { absHostRoot } from '../../settings/env';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishVersion } from './interface';

export class MockHostBotConnector implements IBotConnector {
  constructor() {
    this.history.push(this.createPublishVersion('initial'));
  }

  public status: BotStatus = BotStatus.NotConnected;
  private history: IPublishVersion[] = [];
  private lastSync: IPublishVersion = this.createIntegrationVersion('no one');

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: BotConfig) => {
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';
    this.lastSync = this.createIntegrationVersion(user);
  };

  public getEditingStatus = async (): Promise<boolean> => {
    return false;
  };

  public getPublishVersions = async (): Promise<IPublishVersion[]> => {
    let versions = [];
    this.history.forEach(x => versions.push(x));
    versions.push(this.lastSync);
    return versions;
  };

  public publish = async (config: BotConfig, label: string) => {
    const user = config.user && config.user.deocdedToken ? config.user.deocdedToken[ClaimNames.name] : 'unknown_user';

    this.history.forEach(x => (x.isInProduction = false));

    if (!label) {
      // make a new mock and include it in the list
      let newVersion = this.createPublishVersion(user);
      newVersion.isInProduction = true;
      this.history.push(newVersion);
    } else {
      // find the one they want to publish and mark it as in production
      let found: boolean = false;

      this.history.forEach(x => {
        if (x.label === label) {
          x.isInProduction = true;
          x.publishTimestamp = new Date();
          found = true;
        }
      });

      if (!found) {
        throw new Error('Could not publish. Label not found.');
      }
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
      wasInProduction: true,
      isInProduction: false,
    };
  }

  private createIntegrationVersion(user: string): IPublishVersion {
    const timestamp = new Date();
    const datetimeStamp = timestamp.toISOString().replace(/:/g, '.');
    const tag = `integration_${datetimeStamp}`;
    let version = this.createPublishVersion(user);
    version.label = tag;
    version.wasInProduction = false;
    return version;
  }
}
