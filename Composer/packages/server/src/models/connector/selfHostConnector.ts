import { absHostRoot } from '../../settings/env';

import { BotEnvironments, BotStatus, IBotConnector } from './interface';

export class SelfHostBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;

  public connect = async (env: BotEnvironments, hostName: string) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';
    const root = hostName ? `https://${hostName}` : absHostRoot;

    return Promise.resolve(`${root}/api/${prefix}messages`);
  };

  public sync = async (config: any) => {
    // NYI
  };
}
