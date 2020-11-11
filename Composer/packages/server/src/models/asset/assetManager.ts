// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import find from 'lodash/find';
import { UserIdentity, ExtensionContext, BotTemplate, FileExtensions } from '@bfc/extension';
import { mkdirs, readFile } from 'fs-extra';
import rimraf from 'rimraf';

import log from '../../logger';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';
import { BotProject } from '../bot/botProject';

const execAsync = promisify(exec);
const removeDirAndFiles = promisify(rimraf);

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

  private async getRemoteTemplate(template: BotTemplate, destinationPath: string) {
    // install package
    if (template.package) {
      const { stderr: initErr } = await execAsync(
        `dotnet new -i ${template.package.packageName}::${template.package.packageVersion}`
      );
      if (initErr) {
        throw new Error(initErr);
      }
      const { stderr: initErr2 } = await execAsync(`dotnet new ${template.id}`, {
        cwd: destinationPath,
      });
      if (initErr2) {
        throw new Error(initErr2);
      }
    } else {
      throw new Error('selected template has no local or external address');
    }
  }

  private async copyDataFilesTo(templateId: string, dstDir: string, dstStorage: IFileStorage, locale?: string) {
    const template = find(ExtensionContext.extensions.botTemplates, { id: templateId });
    if (template === undefined || (template.path === undefined && template.package === undefined)) {
      throw new Error(`no such template with id ${templateId}`);
    }

    let templateSrcPath = template.path;
    const isHostedTemplate = !templateSrcPath;
    if (isHostedTemplate) {
      // create empty temp directory on server for holding externally hosted template src
      templateSrcPath = path.resolve(__dirname, '../../../temp');
      if (fs.existsSync(templateSrcPath)) {
        await removeDirAndFiles(templateSrcPath);
      }
      await mkdirs(templateSrcPath, (err) => {
        if (err) {
          throw new Error('Error creating temp directory for external template storage');
        }
      });
      await this.getRemoteTemplate(template, templateSrcPath);
    }

    if (templateSrcPath) {
      // copy Composer data files
      await copyDir(templateSrcPath, this.templateStorage, dstDir, dstStorage);

      if (isHostedTemplate) {
        try {
          await removeDirAndFiles(templateSrcPath);
        } catch (err) {
          throw new Error('Issue deleting temp generated file for external template assets');
        }
      }
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
