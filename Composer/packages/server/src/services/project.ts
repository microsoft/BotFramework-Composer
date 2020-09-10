// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import { importResolverGenerator, ResolverResource } from '@bfc/shared';
import extractMemoryPaths from '@bfc/indexers/lib/dialogUtils/extractMemoryPaths';
import { UserIdentity } from '@bfc/plugin-loader';

import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';

import StorageService from './storage';
import { Path } from './../utility/path';

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

  public static getLgResources(projectId?: string): ResolverResource[] {
    BotProjectService.initialize();
    const project = BotProjectService.getIndexedProjectById(projectId);
    if (!project) throw new Error('project not found');
    const resources = project.lgFiles.map((file) => {
      const { name, content } = file;
      return { id: Path.basename(name, '.lg'), content };
    });
    return resources;
  }

  public static luImportResolver(source: string, id: string, projectId: string): ResolverResource {
    BotProjectService.initialize();
    const project = BotProjectService.getIndexedProjectById(projectId);
    if (!project) throw new Error('project not found');
    const resource = project.luFiles.map((file) => {
      const { name, content } = file;
      return { id: Path.basename(name, '.lu'), content };
    });
    const resolver = importResolverGenerator(resource, '.lu');
    return resolver(source, id);
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
    const projectVariables =
      BotProjectService.getIndexedProjectById(projectId)?.dialogFiles.map(({ content }) => {
        const dialogJson = JSON.parse(content);
        return extractMemoryPaths(dialogJson);
      }) || [];

    const userDefined: string[] = flatten(projectVariables);
    return [...defaultProperties, ...userDefined];
  }

  public static getCurrentBotProject(): BotProject | undefined {
    throw new Error('getCurrentBotProject is DEPRECATED');
  }

  public static getProjectsDateModifiedDict = async (projects: LocationRef[], user?: UserIdentity): Promise<any> => {
    const dateModifiedDict: any = [];
    const promises = projects.map(async (project) => {
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

  public static deleteProject = async (projectId: string): Promise<string> => {
    const path = BotProjectService.projectLocationMap[projectId];
    BotProjectService.removeProjectIdFromCache(projectId);
    return path;
  };

  public static openProject = async (locationRef: LocationRef, user?: UserIdentity): Promise<string> => {
    BotProjectService.initialize();

    // TODO: this should be refactored or moved into the BotProject constructor so that it can use user auth amongst other things
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path, user))) {
      BotProjectService.deleteRecentProject(locationRef.path);
      throw new Error(`file ${locationRef.path} does not exist`);
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

  // clean project registry based on path to avoid reuseing the same id
  public static cleanProject = async (location: LocationRef): Promise<void> => {
    for (const key in BotProjectService.projectLocationMap) {
      if (BotProjectService.projectLocationMap[key] === location.path) {
        delete BotProjectService.projectLocationMap[key];
      }
    }
    Store.set('projectLocationMap', BotProjectService.projectLocationMap);
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

  public static getIndexedProjectById(projectId): BotProject | undefined {
    // use indexed project
    const indexedCurrentProject = BotProjectService.currentBotProjects.find(({ id }) => id === projectId);
    if (indexedCurrentProject) return indexedCurrentProject;
  }

  public static getProjectIdByPath = async (path: string) => {
    for (const key in BotProjectService.projectLocationMap) {
      if (BotProjectService.projectLocationMap[key] === path) {
        return key;
      }
    }
    return null;
  };

  public static getProjectById = async (projectId: string, user?: UserIdentity): Promise<BotProject> => {
    BotProjectService.initialize();

    const path = BotProjectService.projectLocationMap[projectId];

    if (path == null) {
      throw new Error(`project ${projectId} not found in cache`);
    } else {
      // check to make sure the project is still there!
      if (!(await StorageService.checkBlob('default', path, user))) {
        BotProjectService.deleteRecentProject(path);
        BotProjectService.removeProjectIdFromCache(projectId);
        throw new Error(`file ${path} does not exist`);
      }
      const project = new BotProject({ storageId: 'default', path: path }, user);
      await project.init();
      project.id = projectId;
      // update current indexed bot projects
      BotProjectService.updateCurrentProjects(project);
      return project;
    }
  };

  private static updateCurrentProjects = (project: BotProject): void => {
    const { id } = project;
    const idx = BotProjectService.currentBotProjects.findIndex((item) => item.id === id);
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
    const idx = BotProjectService.recentBotProjects.findIndex((ref) => currDir === Path.resolve(ref.path));
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

  public static deleteRecentProject = (path: string): void => {
    const recentBotProjects = BotProjectService.recentBotProjects.filter(
      (ref) => Path.resolve(path) !== Path.resolve(ref.path)
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
      await sourceProject.copyTo(locationRef, user);
      const projectId = await BotProjectService.generateProjectId(locationRef.path);
      BotProjectService.addRecentProject(locationRef.path);
      return projectId;
    } else {
      return '';
    }
  };

  public static checkIfBotProjectSpace = async (location: LocationRef, user?: UserIdentity) => {
    const project = new BotProject(location, user);
    return project.isBotProjectSpace();
  };
}
