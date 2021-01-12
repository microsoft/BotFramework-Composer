/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';
// import { exec } from 'child_process';
// import { promisify } from 'util';

import find from 'lodash/find';
import { UserIdentity, FileExtensions } from '@bfc/extension';
import { mkdirs, readFile } from 'fs-extra';
// import rimraf from 'rimraf';
import yeoman from 'yeoman-environment';

import { ExtensionContext } from '../extension/extensionContext';
import log from '../../logger';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';
import { BotProject } from '../bot/botProject';

// TODO: pass in working directory param to createEnv for desired location of local Yeomen Repo
const yeomanEnv = yeoman.createEnv();
yeomanEnv.lookupLocalPackages();

export class AssetManager {
  public templateStorage: LocalDiskStorage;
  private _botProjectFileTemplate;

  constructor() {
    this.templateStorage = new LocalDiskStorage();
  }

  public get botProjectFileTemplate() {
    if (!this._botProjectFileTemplate) {
      this._botProjectFileTemplate = this.getDefaultBotProjectTemplate();
    }
    return this._botProjectFileTemplate;
  }

  public async getProjectTemplates() {
    return ExtensionContext.extensions.botTemplates;
  }

  public async copyRemoteProjectTemplateTo(
    templateDir: string,
    ref: LocationRef,
    user?: UserIdentity,
    locale?: string
  ): Promise<LocationRef> {
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId, user);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      log('Failed copying template to %s', dstDir);
      throw new Error('already have this folder, please give another name');
    }
    await this.copyTemplateDirTo(templateDir, dstDir, dstStorage, locale);
    return ref;
  }

  private async copyTemplateDirTo(templateDir: string, dstDir: string, dstStorage: IFileStorage, locale?: string) {
    // copy Composer data files
    await copyDir(templateDir, this.templateStorage, dstDir, dstStorage);
    // if we have a locale override, copy those files over too
    if (locale != null) {
      const localePath = path.join(__dirname, '..', '..', '..', 'schemas', `sdk.${locale}.schema`);
      const content = await this.templateStorage.readFile(localePath);
      await dstStorage.writeFile(path.join(dstDir, `sdk.override.schema`), content);

      const uiLocalePath = path.join(__dirname, '..', '..', '..', 'schemas', `sdk.${locale}.uischema`);
      const uiContent = await this.templateStorage.readFile(uiLocalePath);
      await dstStorage.writeFile(path.join(dstDir, `sdk.override.uischema`), uiContent);
    }
  }

  public async copyProjectTemplateTo(
    templateId: string,
    ref: LocationRef,
    user?: UserIdentity,
    locale?: string
  ): Promise<LocationRef> {
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId, user);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      log('Failed copying template to %s', dstDir);
      throw new Error('already have this folder, please give another name');
    }
    await this.copyDataFilesTo(templateId, dstDir, dstStorage, locale);
    return ref;
  }

  public async copyRemoteProjectTemplateToV2(
    templateId: string,
    projectName: string,
    ref: LocationRef,
    user?: UserIdentity,
    locale?: string
  ): Promise<LocationRef> {
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId, user);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      log('Failed copying template to %s', dstDir);
      throw new Error('already have this folder, please give another name');
    }
    await mkdirs(dstDir, (err) => {
      if (err) {
        throw new Error('Error creating destination directory for external template storage');
      }
    });

    // find selected template
    const npmPackageName = templateId;
    const generatorName = npmPackageName.toLowerCase().replace('generator-', '');

    const remoteTemplateAvailable = await this.installRemoteTemplate(generatorName, npmPackageName, dstDir);

    if (remoteTemplateAvailable) {
      await this.instantiateRemoteTemplate(generatorName, dstDir, projectName);
    }

    ref.path = ref.path + `/${projectName}`;

    return ref;
  }

  private async installRemoteTemplate(generatorName: string, npmPackageName: string, dstDir: string): Promise<boolean> {
    const registeredGenerators: string[] = await yeomanEnv.getGeneratorNames();

    if (registeredGenerators.indexOf(generatorName) !== -1) {
      return true;
    } else {
      await yeomanEnv.installLocalGenerators({ [npmPackageName]: '*' });
      await yeomanEnv.lookupLocalPackages();
      return true;
    }
  }

  private async instantiateRemoteTemplate(
    generatorName: string,
    dstDir: string,
    projectName: string
  ): Promise<boolean> {
    yeomanEnv.cwd = dstDir;

    await yeomanEnv.run([generatorName, projectName], {}, () => {
      console.log('DONE');
    });
    return true;
  }

  private async copyDataFilesTo(templateId: string, dstDir: string, dstStorage: IFileStorage, locale?: string) {
    const template = find(ExtensionContext.extensions.botTemplates, { id: templateId });
    if (template === undefined || (template.path === undefined && template.package === undefined)) {
      throw new Error(`no such template with id ${templateId}`);
    }

    const templateSrcPath = template.path;

    if (templateSrcPath) {
      // copy Composer data files
      await copyDir(templateSrcPath, this.templateStorage, dstDir, dstStorage);
    }

    // if we have a locale override, copy those files over too
    if (locale != null) {
      const localePath = path.join(__dirname, '..', '..', '..', 'schemas', `sdk.${locale}.schema`);
      const content = await this.templateStorage.readFile(localePath);
      await dstStorage.writeFile(path.join(dstDir, `sdk.override.schema`), content);

      const uiLocalePath = path.join(__dirname, '..', '..', '..', 'schemas', `sdk.${locale}.uischema`);
      const uiContent = await this.templateStorage.readFile(uiLocalePath);
      await dstStorage.writeFile(path.join(dstDir, `sdk.override.uischema`), uiContent);
    }
  }

  // Copy material from the boilerplate into the project
  // This is used to copy shared content into every new project
  public async copyBoilerplate(dstDir: string, dstStorage: IFileStorage) {
    for (const boilerplate of ExtensionContext.extensions.baseTemplates) {
      const boilerplatePath = boilerplate.path;
      if (boilerplatePath && (await this.templateStorage.exists(boilerplatePath))) {
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
  public async getBoilerplateCurrentVersion(): Promise<string | undefined> {
    if (!ExtensionContext.extensions.baseTemplates.length) {
      return undefined;
    }
    const boilerplate = ExtensionContext.extensions.baseTemplates[0];
    if (boilerplate.path) {
      const location = Path.join(boilerplate.path, 'scripts', 'package.json');
      try {
        if (fs.existsSync(location)) {
          const raw = await readFile(location, 'utf8');

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

  private getDefaultBotProjectTemplate() {
    if (!ExtensionContext.extensions.botTemplates.length) {
      return undefined;
    }
    const boilerplate = ExtensionContext.extensions.botTemplates[0];

    if (boilerplate.path) {
      const location = Path.join(boilerplate.path, `${boilerplate.id + FileExtensions.BotProject}`);
      try {
        if (fs.existsSync(location)) {
          const raw = fs.readFileSync(location, 'utf8');
          const json = JSON.parse(raw);
          return json;
        }
      } catch (err) {
        return '';
      }
    }
  }
}
