// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import find from 'lodash/find';
import { UserIdentity, pluginLoader } from '@bfc/plugin-loader';

import log from '../../logger';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';
import { BotProject } from '../bot/botProject';

export class AssetManager {
  public templateStorage: LocalDiskStorage;

  constructor() {
    this.templateStorage = new LocalDiskStorage();
  }

  public async getProjectTemplates() {
    return pluginLoader.extensions.botTemplates;
  }

  public async copyProjectTemplateTo(templateId: string, ref: LocationRef, user?: UserIdentity): Promise<LocationRef> {
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId, user);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      log('Failed copying template to %s', dstDir);
      throw new Error('already have this folder, please give another name');
    }
    await this.copyDataFilesTo(templateId, dstDir, dstStorage);
    return ref;
  }

  private async copyDataFilesTo(templateId: string, dstDir: string, dstStorage: IFileStorage) {
    const template = find(pluginLoader.extensions.botTemplates, { id: templateId });
    if (template === undefined || template.path === undefined) {
      throw new Error(`no such template with id ${templateId}`);
    }
    // copy Composer data files
    await copyDir(template.path, this.templateStorage, dstDir, dstStorage);
  }

  // Copy material from the boilerplate into the project
  // This is used to copy shared content into every new project
  public async copyBoilerplate(dstDir: string, dstStorage: IFileStorage) {
    for (const boilerplate of pluginLoader.extensions.baseTemplates) {
      const boilerplatePath = boilerplate.path;
      if (await this.templateStorage.exists(boilerplatePath)) {
        await copyDir(boilerplatePath, this.templateStorage, dstDir, dstStorage);
      }
    }
  }

  // read the version number out of the project folder
  // this assumes the boilerplate contains a scripts/ folder containing a pacakge file
  // as of 1.0.1 this is true.
  public async getBoilerplateVersionFromProject(project: BotProject): Promise<string | undefined> {
    const location = Path.join(project.dataDir, 'scripts', 'package.json');
    try {
      if (await project.fileStorage.exists(location)) {
        const raw = await project.fileStorage.readFile(location);
        const json = JSON.parse(raw);
        if (json && json.version) {
          return json.version;
        } else {
          return undefined;
        }
      }
    } catch (err) {
      return undefined;
    }
  }

  // return the current version of the boilerplate content, if one exists so specified
  // this is based off of the first boilerplate template added to the app.
  public getBoilerplateCurrentVersion(): string | undefined {
    if (!pluginLoader.extensions.baseTemplates.length) {
      return undefined;
    }
    const boilerplate = pluginLoader.extensions.baseTemplates[0];
    const location = Path.join(boilerplate.path, 'scripts', 'package.json');
    try {
      if (fs.existsSync(location)) {
        const raw = fs.readFileSync(location, 'utf8');
        const json = JSON.parse(raw);
        if (json && json.version) {
          return json.version;
        } else {
          return undefined;
        }
      }
    } catch (err) {
      return undefined;
    }
  }
}
