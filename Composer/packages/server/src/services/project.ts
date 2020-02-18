// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';

import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';

import StorageService from './storage';
import { Path } from './../utility/path';
import { UserIdentity } from './pluginLoader';

const MAX_RECENT_BOTS = 7;

export class BotProjectService {
  // private static currentBotProject: BotProject | undefined = undefined;
  private static recentBotProjects: LocationRef[] = [];
  private static projectLocationMap: {
    [key: string]: string;
  };

  private static initialize() {
    // if (BotProjectService.currentBotProject) {
    //   return;
    // }

    if (!BotProjectService.recentBotProjects || BotProjectService.recentBotProjects.length === 0) {
      BotProjectService.recentBotProjects = Store.get('recentBotProjects');
    }

    if (!BotProjectService.projectLocationMap || Object.keys(BotProjectService.projectLocationMap).length === 0) {
      BotProjectService.projectLocationMap = Store.get('projectLocationMap') || {};
    }

    // if (BotProjectService.recentBotProjects.length > 0) {
    //   BotProjectService.currentBotProject = new BotProject(BotProjectService.recentBotProjects[0]);
    // }
  }

  public static getCurrentBotProject(): BotProject | undefined {
    throw new Error('DEPRECATED');
    // console.warn('called getCurrentBotPRoject()');
    // BotProjectService.initialize();
    // return BotProjectService.currentBotProject;
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

  public static getProjectById = async (projectId: string, user?: UserIdentity) => {
    BotProjectService.initialize();
    if (!BotProjectService.projectLocationMap[projectId]) {
      throw new Error('project not found in cache');
    } else {
      const project = new BotProject(
        { storageId: 'default', path: BotProjectService.projectLocationMap[projectId] },
        user
      );
      project.id = projectId;
      await project.index();
      return project;
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
