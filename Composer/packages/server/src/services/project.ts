import { BotProject } from '../models/bot/botProject';
import { BotProjectRef } from '../models/bot/interface';
import { Store } from '../store/store';

class BotProjectService {
  public currentBotProject: BotProject | undefined = undefined;
  public recentBotProjects: BotProjectRef[] = [];

  constructor() {}

  public init = () => {
    this.recentBotProjects = Store.get('recentBotProjects');
    if (this.recentBotProjects.length > 0) {
      this.currentBotProject = new BotProject(this.recentBotProjects[0]);
    }
  };

  public getProject = async () => {
    if (this.currentBotProject !== undefined) {
      return await this.currentBotProject.getFiles();
    }
  };
}

const service = new BotProjectService();

export default service;
