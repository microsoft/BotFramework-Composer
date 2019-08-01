import settings from '../settings/settings';
import { absHosted } from '../settings/env';
import {
  BotEnvironments,
  BotStatus,
  CSharpBotConnector,
  IBotConnector,
  SelfHostBotConnector,
} from '../models/connector';

class BotConnectorService {
  private connector: IBotConnector;
  constructor() {
    this.connector = absHosted ? new SelfHostBotConnector() : new CSharpBotConnector(settings.botRuntime);
  }

  // start the current bot
  public connect = async (env: BotEnvironments) => {
    return await this.connector.connect(env || 'production');
  };

  public sync = async (config: any) => {
    return await this.connector.sync(config);
  };

  public status = (): BotStatus => {
    return this.connector.status;
  };
}

const service = new BotConnectorService();
export default service;
