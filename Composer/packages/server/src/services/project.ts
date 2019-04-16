import { BotProject } from '../models/bot/botProject';
import { BotProjectRef } from '../models/bot/interface';
import { Store } from '../store/store';

import StorageService from './storage';

class BotProjectService {
  public currentBotProject: BotProject | undefined = undefined;
  public recentBotProjects: BotProjectRef[] = [];

  constructor() {
    this.recentBotProjects = Store.get('recentBotProjects');
    if (this.recentBotProjects.length > 0) {
      this.currentBotProject = new BotProject(this.recentBotProjects[0]);
    }
  }

  public getProject = async () => {
    if (this.currentBotProject !== undefined) {
      return await this.currentBotProject.getFiles();
    }
  };

  public openProject = async (projRef: BotProjectRef) => {
    if (!(await StorageService.checkBlob(projRef.storageId, projRef.path))) {
      throw new Error(`file not exist ${projRef.path}`);
    }
    this.currentBotProject = new BotProject(projRef);
  };
}

const service = new BotProjectService();
export default service;
