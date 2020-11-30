// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import { luImportResolverGenerator, ResolverResource } from '@bfc/shared';
import extractMemoryPaths from '@bfc/indexers/lib/dialogUtils/extractMemoryPaths';
import { UserIdentity } from '@bfc/extension';
import { ensureDir, existsSync, remove } from 'fs-extra';
import { Request } from 'express';
import formatMessage from 'format-message';

import AssetService from '../services/asset';
import { BotProject } from '../models/bot/botProject';
import { LocationRef } from '../models/bot/interface';
import { Store } from '../store/store';
import log from '../logger';
import { ExtensionContext } from '../models/extension/extensionContext';
import { getLocationRef, getNewProjRef, ejectAndMerge } from '../utility/project';

import StorageService from './storage';
import { Path } from './../utility/path';
import { BackgroundProcessManager } from './backgroundProcessManager';
import { TelemetryService } from './telemetry';

const MAX_RECENT_BOTS = 7;

/** Metadata stored by Composer and associated by internal bot project id */
export type BotProjectMetadata = {
  alias?: string;
  eTag?: string;
  path: string;
};

export type BotProjectLocationMap = Record<string, BotProjectMetadata>;

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
      BotProjectService.recentBotProjects = Store.get('recentBotProjects', []);
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

  public static staticEntityResolver(projectId: string): string[] | undefined {
    const contents = BotProjectService.getIndexedProjectById(projectId)?.luFiles.map((file) => file.content);
    return flatten(contents);
  }

  public static getCurrentBotProject(): BotProject | undefined {
    throw new Error('getCurrentBotProject is DEPRECATED');
  }

  public static getProjectsDateModifiedDict = async (
    projects: LocationRef[],
    user?: UserIdentity
  ): Promise<{ dateModified: string; path: string }[]> => {
    const dateModifiedDict: { dateModified: string; path: string }[] = [];
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
    const allRecentBots = BotProjectService.recentBotProjects;

    const recentBots = allRecentBots
      .filter((bot) => !Path.basename(bot.path).includes('.botproj'))
      .map((bot) => ({
        ...bot,
        name: Path.basename(bot.path),
      }));

    return recentBots.map((item) => {
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
        throw new Error(`${path} doesn't seem to be exist any longer`);
      }
      const project = new BotProject({ storageId: 'default', path: path }, user, eTag);
      await project.init();
      project.id = projectId;
      // update current indexed bot projects
      BotProjectService.updateCurrentProjects(project);
      await ExtensionContext.emit('project:opened', project);
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
          throw new Error(`${path} doesn't seem to be exist any longer`);
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

  public static backupProject = async (project: BotProject): Promise<string> => {
    try {
      // ensure there isn't an older backup directory hanging around
      const projectDirName = Path.basename(project.dir);
      const backupPath = Path.join(process.env.COMPOSER_BACKUP_DIR as string, `${projectDirName}.${Date.now()}`);
      await ensureDir(process.env.COMPOSER_BACKUP_DIR as string);
      if (existsSync(backupPath)) {
        log('%s already exists. Deleting before backing up.', backupPath);
        await remove(backupPath);
        log('Existing backup folder deleted successfully.');
      }

      // clone the bot project to the backup directory
      const location: LocationRef = {
        storageId: 'default',
        path: backupPath,
      };
      log('Backing up project at %s to %s', project.dir, backupPath);
      await project.cloneFiles(location);
      log('Project backed up successfully.');
      return location.path;
    } catch (e) {
      throw new Error(`Failed to backup project ${project.id}: ${e}`);
    }
  };

  public static async createProjectAsync(req: Request, jobId: string) {
    const {
      templateId,
      templateVersion,
      name,
      description,
      storageId,
      location,
      preserveRoot,
      templateDir,
      eTag,
      alias,
      locale,
      schemaUrl,
    } = req.body;
    // get user from request
    const user = await ExtensionContext.getUserFromRequest(req);

    const createFromPva = !!templateDir;

    // populate template if none was passed
    if (templateId === '') {
      // TODO: Replace with default template once one is determined
      throw Error('empty templateID passed');
    }
    // location to store the bot project
    const locationRef = getLocationRef(location, storageId, name);
    try {
      await BotProjectService.cleanProject(locationRef);

      // Update status for polling
      BackgroundProcessManager.updateProcess(jobId, 202, formatMessage('Getting template'));

      const newProjRef = createFromPva
        ? await getNewProjRef(templateDir, templateId, locationRef, user, locale)
        : await AssetService.manager.copyRemoteProjectTemplateToV2(
            templateId,
            templateVersion,
            name,
            locationRef,
            user
          );

      BackgroundProcessManager.updateProcess(jobId, 202, formatMessage('Bot files created'));

      const botsToProcess: { storageId: string; path: string; name: string }[] = [];

      // The outcome of our creation might be > 1 bot! We need to determine how many bots we find in this folder.
      // is this a single bot?
      if (await StorageService.checkIsBotFolder(newProjRef.storageId, newProjRef.path, user)) {
        botsToProcess.push({ ...newProjRef, name });
      } else {
        // or multiple bots?
        const files = await StorageService.getBlob(newProjRef.storageId, newProjRef.path, user);
        const childbots = files.children.filter((f) => f.type === 'bot');

        childbots.forEach((b) => {
          botsToProcess.push({
            storageId: newProjRef.storageId,
            path: b.path,
            name: b.name,
          });
        });
      }

      await Promise.all(
        botsToProcess.map((botRef) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve, reject) => {
            try {
              log('Open project', botRef);
              const id = await BotProjectService.openProject(botRef, user);

              // in the case of PVA, we need to update the eTag and alias used by the import mechanism
              createFromPva && BotProjectService.setProjectLocationData(id, { alias, eTag });

              log('Get Project by Id', id);
              const currentProject = await BotProjectService.getProjectById(id, user);

              // inject shared content into every new project.  this comes from assets/shared
              !createFromPva &&
                (await AssetService.manager.copyBoilerplate(currentProject.dataDir, currentProject.fileStorage));

              if (currentProject !== undefined) {
                !createFromPva && (await ejectAndMerge(currentProject, jobId));
                BackgroundProcessManager.updateProcess(jobId, 202, formatMessage('Initializing bot project'));

                log('Updatebot info', id, preserveRoot);
                await currentProject.updateBotInfo(botRef.name, description, true);

                if (schemaUrl && !createFromPva) {
                  await currentProject.saveSchemaToProject(schemaUrl, botRef.path);
                }

                log('Init project', id);
                await currentProject.init();
              }
              resolve(id);
            } catch (err) {
              return reject(err);
            }
          });
        })
      );

      const rootBot = botsToProcess.find((b) => b.name === name);
      if (rootBot) {
        const id = await BotProjectService.openProject({ storageId: rootBot?.storageId, path: rootBot.path }, user);
        const currentProject = await BotProjectService.getProjectById(id, user);
        const project = currentProject.getProject();
        log('Project created successfully.');
        BackgroundProcessManager.updateProcess(jobId, 200, 'Created Successfully', {
          id,
          ...project,
        });

        TelemetryService.trackEvent('CreateNewBotProjectCompleted', { template: templateId, status: 200 });
      } else {
        throw new Error('Could not find root bot');
      }
    } catch (err) {
      BackgroundProcessManager.updateProcess(jobId, 500, err instanceof Error ? err.message : err, err);
      TelemetryService.trackEvent('CreateNewBotProjectCompleted', { template: templateId, status: 500 });
    }
  }
}
