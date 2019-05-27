import settings from '../settings/settings';
import { IBotConnector, BotStatus } from '../models/connector/interface';
import { CSharpBotConnector } from '../models/connector/csharpBotConnector';

class BotConnectorService {
  private connector: IBotConnector;
  constructor() {
    this.connector = new CSharpBotConnector(settings.botRuntime);
  }

  // start the current bot
  public connect = async () => {
    return await this.connector.connect();
  };

  public sync = async () => {
    return await this.connector.sync();
  };

  public status = (): BotStatus => {
    return this.connector.status;
  };
}

const service = new BotConnectorService();
export default service;
