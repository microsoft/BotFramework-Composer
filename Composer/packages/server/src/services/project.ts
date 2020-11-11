// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import { luImportResolverGenerator, ResolverResource } from '@bfc/shared';
import extractMemoryPaths from '@bfc/indexers/lib/dialogUtils/extractMemoryPaths';
import { UserIdentity } from '@bfc/extension';

import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';

import StorageService from './storage';
import { Path } from './../utility/path';

const MAX_RECENT_BOTS = 7;

/** Metadata stored by Composer and associated by internal bot project id */
type BotProjectMetadata = {
  alias?: string;
  eTag?: string;
  path: string;
};

type BotProjectLocationMap = Record<string, BotProjectMetadata>;

/** Converts old bot project location maps to the new shape */
function fixOldBotProjectMapEntries(
  projectMap: BotProjectLocationMap | { [key: string]: string }
): BotProjectLocationMap {
  const map: BotProjectLocationMap = {};
  for (const botId in projectMap) {
    const entry = projectMap[botId];
    if (typeof entry === 'string') {
      map[botId] = {
        path: entry,
        eTag: '',
      };
    } else {
      map[botId] = entry;
    }
  }
  return map;
}

export class BotProjectService {
  private static currentBotProjects: BotProject[] = [];
  private static recentBotProjects: LocationRef[] = [];
  private static projectLocationMap: BotProjectLocationMap;

  private static initialize() {
    if (!BotProjectService.recentBotProjects || BotProjectService.recentBotProjects.length === 0) {
      BotProjectService.recentBotProjects = Store.get('recentBotProjects');
    }

    if (!BotProjectService.projectLocationMap || Object.keys(BotProjectService.projectLocationMap).length === 0) {
      BotProjectService.projectLocationMap = fixOldBotProjectMapEntries(Store.get('projectLocationMap', {}));
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
    const resolver = luImportResolverGenerator(resource, '.lu');
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
    const projectLoc = BotProjectService.projectLocationMap[projectId];
    if (!projectLoc) {
      // no-op
      return '';
    } else {
      const { path = '' } = projectLoc;
      BotProjectService.removeProjectIdFromCache(projectId);
      return path;
    }
  };

  public static openProject = async (locationRef: LocationRef, user?: UserIdentity): Promise<string> => {
    BotProjectService.initialize();

    // TODO: this should be refactored or moved into the BotProject constructor so that it can use user auth amongst other things
    if (!(await StorageService.checkBlob(locationRef.storageId, locationRef.path, user))) {
      BotProjectService.deleteRecentProject(locationRef.path);
      throw new Error(`file ${locationRef.path} does not exist`);
    }

    if (!(await StorageService.checkIsBotFolder(locationRef.storageId, locationRef.path, user))) {
      throw new Error(`${locationRef.path} is not a bot project folder`);
    }

    for (const key in BotProjectService.projectLocationMap) {
      const projectLoc = BotProjectService.projectLocationMap[key];
      if (projectLoc && projectLoc.path === locationRef.path) {
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
      const projectLoc = BotProjectService.projectLocationMap[key];
      if (projectLoc && projectLoc.path === location.path) {
        delete BotProjectService.projectLocationMap[key];
      }
    }
    Store.set('projectLocationMap', BotProjectService.projectLocationMap);
  };

  public static generateProjectId = async (path: string): Promise<string> => {
    const projectId = (Math.random() * 100000).toString();
    BotProjectService.projectLocationMap[projectId] = { eTag: '', path };
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
      const projectLoc = BotProjectService.projectLocationMap[key];
      if (projectLoc && projectLoc.path === path) {
        return key;
      }
    }
    return null;
  };

  public static getProjectById = async (projectId: string, user?: UserIdentity): Promise<BotProject> => {
    BotProjectService.initialize();

    const projectLoc = BotProjectService.projectLocationMap[projectId];

    if (!projectLoc || projectLoc.path == null) {
      throw new Error(`project ${projectId} not found in cache`);
    } else {
      const { eTag, path } = projectLoc;
      // check to make sure the project is still there!
      if (!(await StorageService.checkBlob('default', path, user))) {
        BotProjectService.deleteRecentProject(path);
        BotProjectService.removeProjectIdFromCache(projectId);
        throw new Error(`file ${path} does not exist`);
      }
      const project = new BotProject({ storageId: 'default', path: path }, user, eTag);
      await project.init();
      project.id = projectId;
      // update current indexed bot projects
      BotProjectService.updateCurrentProjects(project);
      return project;
    }
  };

  public static setProjectLocationData(projectId: string, data: Partial<BotProjectMetadata>): void {
    const projectLoc = BotProjectService.projectLocationMap[projectId];
    if (projectLoc) {
      // filter out undefined values
      for (const key in data) {
        if (data[key] === undefined) {
          delete data[key];
        }
      }
      log('Updating project location data for %s: %O', projectId, data);
      BotProjectService.projectLocationMap[projectId] = {
        ...projectLoc,
        ...data,
      };
      Store.set('projectLocationMap', BotProjectService.projectLocationMap);
    }
  }

  public static getProjectByAlias = async (alias: string, user?: UserIdentity): Promise<BotProject | undefined> => {
    BotProjectService.initialize();

    let matchingProjectId;
    for (const projectId in BotProjectService.projectLocationMap) {
      const info = BotProjectService.projectLocationMap[projectId];
      if (info.alias && info.alias === alias) {
        matchingProjectId = projectId;
        break;
      }
    }

    if (matchingProjectId) {
      const { eTag, path } = BotProjectService.projectLocationMap[matchingProjectId];
      if (path == null) {
        throw new Error(`project ${matchingProjectId} not found in cache`);
      } else {
        // check to make sure the project is still there!
        if (!(await StorageService.checkBlob('default', path, user))) {
          BotProjectService.deleteRecentProject(path);
          BotProjectService.removeProjectIdFromCache(matchingProjectId);
          throw new Error(`file ${path} does not exist`);
        }
        const project = new BotProject({ storageId: 'default', path: path }, user, eTag);
        await project.init();
        project.id = matchingProjectId;
        // update current indexed bot projects
        BotProjectService.updateCurrentProjects(project);
        return project;
      }
    } else {
      // no match found
      return undefined;
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
}
