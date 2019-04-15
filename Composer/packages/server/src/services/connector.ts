import settings from '../settings/settings.json';
import { IBotConnector } from '../models/connector/interface';
import { ConnectorFactory } from '../models/connector/connectorFactory';

import BotProjectService from './project';

class BotConnectorService {
  private connector: IBotConnector;
  constructor() {
    this.connector = ConnectorFactory.createConnector(settings.botConnector);
  }

  // start the current bot
  public start = () => {
    if (BotProjectService.currentBotProject === undefined) {
      throw new Error('Not opened bot to start');
    }

    const projRef = {
      storageId: BotProjectService.currentBotProject.ref.storageId,
      path: BotProjectService.currentBotProject.absolutePath,
    };
    this.connector.start(projRef);
  };

  public stop = () => {
    this.connector.stop();
  };

  public status = () => {
    return this.connector.status;
  };
}

const service = new BotConnectorService();
export default service;
