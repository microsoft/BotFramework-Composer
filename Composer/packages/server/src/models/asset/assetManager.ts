// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import find from 'lodash/find';
import { UserIdentity, ExtensionContext } from '@bfc/extension';

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

  public async copyProjectTemplateDirTo(
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

  private async copyDataFilesTo(templateId: string, dstDir: string, dstStorage: IFileStorage, locale?: string) {
    const template = find(ExtensionContext.extensions.botTemplates, { id: templateId });
    if (template === undefined || template.path === undefined) {
      throw new Error(`no such template with id ${templateId}`);
    }
    // copy Composer data files
    await copyDir(template.path, this.templateStorage, dstDir, dstStorage);
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
    if (!ExtensionContext.extensions.baseTemplates.length) {
      return undefined;
    }
    const boilerplate = ExtensionContext.extensions.baseTemplates[0];
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

  private getDefaultBotProjectTemplate() {
    if (!ExtensionContext.extensions.botTemplates.length) {
      return undefined;
    }
    const boilerplate = ExtensionContext.extensions.botTemplates[0];

    const location = Path.join(boilerplate.path, `${boilerplate.id}.botproj`);
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
