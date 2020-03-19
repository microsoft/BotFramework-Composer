// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';
import { TextFile } from '@bfc/shared';

import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';

import StorageService from './storage';
import { Path } from './../utility/path';
import { UserIdentity } from './pluginLoader';

const MAX_RECENT_BOTS = 7;

export class BotProjectService {
  private static currentBotProjects: BotProject[] = [];
  private static recentBotProjects: LocationRef[] = [];
  private static projectLocationMap: {
    [key: string]: string;
  };

  private static initialize() {
    if (!BotProjectService.recentBotProjects || BotProjectService.recentBotProjects.length === 0) {
      BotProjectService.recentBotProjects = Store.get('recentBotProjects');
    }

    if (!BotProjectService.projectLocationMap || Object.keys(BotProjectService.projectLocationMap).length === 0) {
      BotProjectService.projectLocationMap = Store.get('projectLocationMap', {});
    }
  }

  public static lgImportResolver(_source: string, id: string, projectId: string): TextFile {
    BotProjectService.initialize();
    const targetId = Path.basename(id, '.lg');
    const targetFile = BotProjectService.currentBotProjects
      .find(({ id }) => id === projectId)
      ?.lgFiles.find(({ id }) => id === targetId);
    if (!targetFile) throw new Error('lg file not found');
    return {
      id,
      content: targetFile.content,
    };
  }

  public static luImportResolver(_source: string, id: string, projectId: string): any {
    BotProjectService.initialize();
    const targetId = Path.basename(id, '.lu');
    const targetFile = BotProjectService.currentBotProjects
      .find(({ id }) => id === projectId)
      ?.luFiles.find(({ id }) => id === targetId);
    if (!targetFile) throw new Error('lu file not found');
    return {
      id,
      content: targetFile.content,
    };
  }

  public static staticMemoryResolver(projectId: string): string[] {
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
      BotProjectService.currentBotProjects[projectId]?.dialogs.reduce((result: string[], dialog) => {
        result = [...dialog.userDefinedVariables, ...result];
        return result;
      }, []) || [];
    return [...defaultProperties, ...userDefined];
  }

  public static getCurrentBotProject(): BotProject | undefined {
    throw new Error('getCurrentBotProject is DEPRECATED');
  }

  public static getProjectsDateModifiedDict = async (projects: LocationRef[], user?: UserIdentity): Promise<any> => {
    const dateModifiedDict: any = [];
    const promises = projects.map(async project => {
      let dateModified = '';
      try {
        dateModified = await StorageService.getBlobDateModified(project.storageId, project.path, user);
        dateModifiedDict.push({ dateModified, path: project.path });
      } catch (err) {
        log(err);
      }
    });
    await Promise.all(promises);
    return dateModifiedDict;
  };

  public static getRecentBotProjects = async (user?: UserIdentity) => {
    BotProjectService.initialize();
    const dateModifiedDict = await BotProjectService.getProjectsDateModifiedDict(
      BotProjectService.recentBotProjects,
      user
    );
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

  public static openProject = async (locationRef: LocationRef, user?: UserIdentity): Promise<string> => {
    BotProjectService.initialize();

    // TODO: this should be refactored or moved into the BotProject constructor so that it can use user auth amongst other things
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path, user))) {
      BotProjectService.deleteRecentProject(locationRef.path);
      throw new Error(`file not exist ${locationRef.path}`);
    }

    for (const key in BotProjectService.projectLocationMap) {
      if (BotProjectService.projectLocationMap[key] === locationRef.path) {
        // TODO: this should probably move to getProjectById
        BotProjectService.addRecentProject(locationRef.path);
        return key;
      }
    }

    // generate an id and store it in the projectLocationMap
    const projectId = await BotProjectService.generateProjectId(locationRef.path);
    BotProjectService.addRecentProject(locationRef.path);
    Store.set('projectLocationMap', BotProjectService.projectLocationMap);
    return projectId.toString();
  };

  public static generateProjectId = async (path: string): Promise<string> => {
    const projectId = (Math.random() * 100000).toString();
    BotProjectService.projectLocationMap[projectId] = path;
    return projectId;
  };

  private static removeProjectIdFromCache = (projectId: string): void => {
    delete BotProjectService.projectLocationMap[projectId];
    Store.set('projectLocationMap', BotProjectService.projectLocationMap);
  };

  public static getProjectById = async (projectId: string, user?: UserIdentity) => {
    BotProjectService.initialize();

    if (!BotProjectService.projectLocationMap?.[projectId]) {
      throw new Error('project not found in cache');
    } else {
      const path = BotProjectService.projectLocationMap[projectId];
      // check to make sure the project is still there!
      if (!(await StorageService.checkBlob('default', path, user))) {
        BotProjectService.deleteRecentProject(path);
        BotProjectService.removeProjectIdFromCache(projectId);
        throw new Error(`file not exist ${path}`);
      }
      const project = new BotProject({ storageId: 'default', path: path }, user);
      project.id = projectId;
      await project.index();
      // update current indexed bot projects
      BotProjectService.updateCurrentProjects(project);
      return project;
    }
  };

  private static updateCurrentProjects = (project: BotProject): void => {
    const { id } = project;
    const idx = BotProjectService.currentBotProjects.findIndex(item => item.id === id);
    if (idx > -1) {
      BotProjectService.currentBotProjects.splice(idx, 1);
    }
    BotProjectService.currentBotProjects.unshift(project);

    if (BotProjectService.currentBotProjects.length > MAX_RECENT_BOTS) {
      BotProjectService.currentBotProjects = BotProjectService.currentBotProjects.slice(0, MAX_RECENT_BOTS);
    }
  };

  private static addRecentProject = (path: string): void => {
    // if (!BotProjectService.currentBotProject) {
    //   return;
    // }
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

  public static saveProjectAs = async (
    sourceProject: BotProject,
    locationRef: LocationRef,
    user?: UserIdentity
  ): Promise<string> => {
    BotProjectService.initialize();
    if (typeof sourceProject !== 'undefined') {
      const newCurrentProject = await sourceProject.copyTo(locationRef, user);
      await newCurrentProject.index();
      const projectId = await BotProjectService.generateProjectId(locationRef.path);
      BotProjectService.addRecentProject(locationRef.path);
      return projectId;
    } else {
      return '';
    }
  };
}
