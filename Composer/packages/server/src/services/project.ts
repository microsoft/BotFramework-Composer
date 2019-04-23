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

  public openProject = async (projRef: BotProjectRef) => {
    if (!(await StorageService.checkBlob(projRef.storageId, projRef.path))) {
      throw new Error(`file not exist ${projRef.path}`);
    }
    this.currentBotProject = new BotProject(projRef);
    await this.currentBotProject.index();
    this.updateRecentBotProjects();
  };

  private updateRecentBotProjects(): void {
    if (!this.currentBotProject) {
      return;
    }

    const currRef = this.currentBotProject.ref;
    const idx = this.recentBotProjects.findIndex(ref => currRef.path === ref.path);

    if (idx > -1) {
      this.recentBotProjects.splice(idx, 1);
    }

    this.recentBotProjects.unshift(this.currentBotProject.ref);
    Store.set('recentBotProjects', this.recentBotProjects);
  }

  public saveProjectAs = async (projRef: BotProjectRef) => {
    if (typeof this.currentBotProject !== 'undefined') {
      this.currentBotProject = await this.currentBotProject.copyTo(projRef);
      await this.currentBotProject.index();
    }
  };
}

const service = new BotProjectService();
export default service;
