import settings from '../settings/settings';
import { absHosted } from '../settings/env';
import {
  BotEnvironments,
  BotStatus,
  CSharpBotConnector,
  IBotConnector,
  SelfHostBotConnector,
  IPublishHistory,
} from '../models/connector';

class BotConnectorService {
  private connector: IBotConnector;
  constructor() {
    this.connector = absHosted ? new SelfHostBotConnector() : new CSharpBotConnector(settings.botRuntime);
  }

  // start the current bot
  public connect = async (env: BotEnvironments, hostName: string) => {
    return await this.connector.connect(env || 'production', hostName);
  };

  public sync = async (config: any) => {
    return await this.connector.sync(config);
  };

  public status = (): BotStatus => {
    return this.connector.status;
  };

  public publish = async (config: any, label: string) => {
    return await this.connector.publish(config, label);
  };

  public getEditingStatus = async (): Promise<boolean> => {
    return await this.connector.getEditingStatus();
  };

  public getPublishHistory = async (): Promise<IPublishHistory> => {
    return await this.connector.getPublishHistory();
  };
}

const service = new BotConnectorService();
export default service;
