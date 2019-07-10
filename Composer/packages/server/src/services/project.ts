import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';

import StorageService from './storage';

class BotProjectService {
  public currentBotProject: BotProject | undefined = undefined;
  public recentBotProjects: LocationRef[] = [];

  constructor() {
    this.recentBotProjects = Store.get('recentBotProjects');
    if (this.recentBotProjects.length > 0) {
      this.currentBotProject = new BotProject(this.recentBotProjects[0]);
    }
  }

  public openProject = async (locationRef: LocationRef) => {
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path))) {
      throw new Error(`file not exist ${locationRef.path}`);
    }
    this.currentBotProject = new BotProject(locationRef);
    await this.currentBotProject.index();
    this.updateRecentBotProjects();
  };

  private updateRecentBotProjects(): void {
    if (!this.currentBotProject) {
      return;
    }

    const currDir = this.currentBotProject.dir;
    const idx = this.recentBotProjects.findIndex(ref => currDir === ref.path);
    if (idx > -1) {
      this.recentBotProjects.splice(idx, 1);
    }

    const toSaveRecentProject = { storageId: 'default', path: currDir };
    this.recentBotProjects.unshift(toSaveRecentProject);
    Store.set('recentBotProjects', this.recentBotProjects);
  }

  public saveProjectAs = async (locationRef: LocationRef) => {
    if (typeof this.currentBotProject !== 'undefined') {
      this.currentBotProject = await this.currentBotProject.copyTo(locationRef);
      await this.currentBotProject.index();
      this.updateRecentBotProjects();
    }
  };
}

const service = new BotProjectService();
export default service;
