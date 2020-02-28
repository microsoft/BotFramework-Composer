// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';
import { TextFile } from '@bfc/indexers';

import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';

import StorageService from './storage';
import { Path } from './../utility/path';

const MAX_RECENT_BOTS = 7;

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

  public static lgImportResolver(_source: string, id: string): TextFile {
    BotProjectService.initialize();
    const targetId = Path.basename(id, '.lg');
    const targetFile = BotProjectService.currentBotProject?.lgFiles.find(({ id }) => id === targetId);
    if (!targetFile) throw new Error('lg file not found');
    return {
      id,
      content: targetFile.content,
    };
  }

  public static luImportResolver(_source: string, id: string): any {
    BotProjectService.initialize();
    const targetId = Path.basename(id, '.lu');
    const targetFile = BotProjectService.currentBotProject?.luFiles.find(({ id }) => id === targetId);
    if (!targetFile) throw new Error('lu file not found');
    return {
      id,
      content: targetFile.content,
    };
  }

  public static staticMemoryResolver(): string[] {
    const defaultProperties = [
      'this.value',
      'this.turnCount',
      'this.options',
      'dialog.eventCounter',
      'dialog.expectedProperties',
      'dialog.lastEvent',
      'dialog.requiredProperties',
      'dialog.retries',
      'dialog.lastIntent',
      'dialog.lastTriggerEvent',
      'turn.lastresult',
      'turn.activity',
      'turn.recognized',
      'turn.recognized.intent',
      'turn.recognized.score',
      'turn.recognized.text',
      'turn.unrecognizedText',
      'turn.recognizedEntities',
      'turn.interrupted',
      'turn.dialogEvent',
      'turn.repeatedIds',
      'turn.activityProcessed',
    ];
    const userDefined: string[] =
      BotProjectService.currentBotProject?.dialogs.reduce((result: string[], dialog) => {
        result = [...dialog.userDefinedVariables, ...result];
        return result;
      }, []) || [];
    return [...defaultProperties, ...userDefined];
  }

  public static getCurrentBotProject(): BotProject | undefined {
    BotProjectService.initialize();
    return BotProjectService.currentBotProject;
  }

  public static getProjectsDateModifiedDict = async (projects: LocationRef[]): Promise<any> => {
    const dateModifiedDict: any = [];
    const promises = projects.map(async project => {
      let dateModified = '';
      try {
        dateModified = await StorageService.getBlobDateModified(project.storageId, project.path);
        dateModifiedDict.push({ dateModified, path: project.path });
      } catch (err) {
        log(err);
      }
    });
    await Promise.all(promises);
    return dateModifiedDict;
  };

  public static getRecentBotProjects = async () => {
    BotProjectService.initialize();
    const dateModifiedDict = await BotProjectService.getProjectsDateModifiedDict(BotProjectService.recentBotProjects);
    const recentBots = BotProjectService.recentBotProjects.reduce((result: any[], item) => {
      const name = Path.basename(item.path);
      //remove .botproj. Someone may open project before new folder structure.
      if (!name.includes('.botproj')) {
        result.push({ name, ...item });
      }
      return result;
    }, []);

    return recentBots.map((item: any) => {
      return merge(item, find(dateModifiedDict, { path: item.path }));
    });
  };

  public static openProject = async (locationRef: LocationRef) => {
    BotProjectService.initialize();
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path))) {
      BotProjectService.deleteRecentProject(locationRef.path);
      throw new Error(`file not exist ${locationRef.path}`);
    }
    // TODO: possible race condition with openProject and saveProjectAs
    // eslint-disable-next-line require-atomic-updates
    BotProjectService.currentBotProject = new BotProject(locationRef);
    await BotProjectService.currentBotProject.index();
    BotProjectService.addRecentProject(locationRef.path);
  };

  private static addRecentProject = (path: string): void => {
    if (!BotProjectService.currentBotProject) {
      return;
    }
    const currDir = Path.resolve(path);
    const idx = BotProjectService.recentBotProjects.findIndex(ref => currDir === Path.resolve(ref.path));
    if (idx > -1) {
      BotProjectService.recentBotProjects.splice(idx, 1);
    }
    const toSaveRecentProject = { storageId: 'default', path: currDir };
    BotProjectService.recentBotProjects.unshift(toSaveRecentProject);

    // remove LRU bot project
    if (BotProjectService.recentBotProjects.length > MAX_RECENT_BOTS) {
      BotProjectService.recentBotProjects = BotProjectService.recentBotProjects.slice(0, MAX_RECENT_BOTS);
    }

    Store.set('recentBotProjects', BotProjectService.recentBotProjects);
  };

  private static deleteRecentProject = (path: string): void => {
    const recentBotProjects = BotProjectService.recentBotProjects.filter(
      ref => Path.resolve(path) !== Path.resolve(ref.path)
    );
    BotProjectService.recentBotProjects = recentBotProjects;
    Store.set('recentBotProjects', recentBotProjects);
  };

  public static saveProjectAs = async (locationRef: LocationRef) => {
    BotProjectService.initialize();
    if (typeof BotProjectService.currentBotProject !== 'undefined') {
      const newCurrentProject = await BotProjectService.currentBotProject.copyTo(locationRef);
      // eslint-disable-next-line require-atomic-updates
      BotProjectService.currentBotProject = newCurrentProject;
      await BotProjectService.currentBotProject.index();
      BotProjectService.addRecentProject(locationRef.path);
    }
  };
}
