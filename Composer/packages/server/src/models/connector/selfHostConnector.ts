import { absHostRoot } from '../../settings/env';

import { BotEnvironments, BotStatus, IBotConnector } from './interface';

export class SelfHostBotConnector implements IBotConnector {
  public status: BotStatus = BotStatus.NotConnected;

  public connect = async (env: BotEnvironments) => {
    this.status = BotStatus.Connected;
    const prefix = env === 'production' ? '' : 'integration/';

    return Promise.resolve(`${absHostRoot}/api/${prefix}messages`);
  };

  public sync = async (config: any) => {
    // NYI
  };
}
