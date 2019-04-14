import { BotProject } from '../models/bot/botProject';
import Storage from '../../storage.json';

class BotProjectService {
  public currentBotProject: BotProject | undefined = undefined;

  constructor() {}

  public init = () => {
    this.currentBotProject = new BotProject(Storage.recentAccessedBots[0]);
  };

  public getProject = () => {
    if (this.currentBotProject !== undefined) {
      return this.currentBotProject.getFiles();
    }
  };
}

const service = new BotProjectService();

export default service;
