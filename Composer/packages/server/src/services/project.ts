import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';

import StorageService from './storage';
import { Path } from './../utility/path';

export class BotProjectService {
  private static currentBotProject: BotProject | undefined = undefined;
  private static recentBotProjects: LocationRef[] = [];

  private static initialize() {
    if (BotProjectService.currentBotProject) {
      return;
    }

    if (!BotProjectService.recentBotProjects || BotProjectService.recentBotProjects.length === 0) {
      BotProjectService.recentBotProjects = Store.get('recentBotProjects');
    }

    if (BotProjectService.recentBotProjects.length > 0) {
      BotProjectService.currentBotProject = new BotProject(BotProjectService.recentBotProjects[0]);
    }
  }

  public static getCurrentBotProject(): BotProject | undefined {
    BotProjectService.initialize();
    return BotProjectService.currentBotProject;
  }

  public static getRecentBotProjects = () => {
    BotProjectService.initialize();
    return BotProjectService.recentBotProjects.reduce((result: any[], item) => {
      const name = Path.basename(item.path);
      //remove .botproj. Someone may open project before new folder structure.
      if (!name.includes('.botproj')) {
        result.push({ name, ...item });
      }
      return result;
    }, []);
  };

  public static openProject = async (locationRef: LocationRef) => {
    BotProjectService.initialize();
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path))) {
      throw new Error(`file not exist ${locationRef.path}`);
    }
    BotProjectService.currentBotProject = new BotProject(locationRef);
    await BotProjectService.currentBotProject.index();
    BotProjectService.updateRecentBotProjects();
  };

  private static updateRecentBotProjects(): void {
    if (!BotProjectService.currentBotProject) {
      return;
    }

    const currDir = BotProjectService.currentBotProject.dir;
    const idx = BotProjectService.recentBotProjects.findIndex(ref => currDir === ref.path);
    if (idx > -1) {
      BotProjectService.recentBotProjects.splice(idx, 1);
    }

    const toSaveRecentProject = { storageId: 'default', path: currDir };
    BotProjectService.recentBotProjects.unshift(toSaveRecentProject);
    Store.set('recentBotProjects', BotProjectService.recentBotProjects);
  }

  public static saveProjectAs = async (locationRef: LocationRef) => {
    BotProjectService.initialize();
    if (typeof BotProjectService.currentBotProject !== 'undefined') {
      BotProjectService.currentBotProject = await BotProjectService.currentBotProject.copyTo(locationRef);
      await BotProjectService.currentBotProject.index();
      BotProjectService.updateRecentBotProjects();
    }
  };
}
