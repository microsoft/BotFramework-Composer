// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

import find from 'lodash/find';
import { UserIdentity, FileExtensions, BotTemplateV2, FeedType } from '@bfc/extension';
import { mkdirSync, readFile } from 'fs-extra';
import yeoman from 'yeoman-environment';
import Environment from 'yeoman-environment';
import TerminalAdapter from 'yeoman-environment/lib/adapter';

import { ExtensionContext } from '../extension/extensionContext';
import log from '../../logger';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';
import { BotProject } from '../bot/botProject';
import { templateGeneratorPath } from '../../settings/env';

export class AssetManager {
  public templateStorage: LocalDiskStorage;
  public yeomanEnv: Environment;
  private _botProjectFileTemplate;

  constructor() {
    this.templateStorage = new LocalDiskStorage();
    this.yeomanEnv = yeoman.createEnv(
      '',
      { yeomanRepository: templateGeneratorPath },
      new TerminalAdapter({ console: console })
    );
    this.yeomanEnv.lookupLocalPackages();
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
    templateVersion: string,
    projectName: string,
    ref: LocationRef,
    user?: UserIdentity
  ): Promise<LocationRef> {
    try {
      // user storage maybe diff from template storage
      const dstStorage = StorageService.getStorageClient(ref.storageId, user);
      const dstDir = Path.resolve(ref.path);
      if (await dstStorage.exists(dstDir)) {
        log('Failed copying template to %s', dstDir);
        throw new Error('already have this folder, please give another name');
      }

      log('About to create folder', dstDir);
      mkdirSync(dstDir, { recursive: true });

      // find selected template
      const npmPackageName = templateId;
      const generatorName = npmPackageName.toLowerCase().replace('generator-', '');

      const remoteTemplateAvailable = await this.installRemoteTemplate(generatorName, npmPackageName, templateVersion);

      if (remoteTemplateAvailable) {
        await this.instantiateRemoteTemplate(generatorName, dstDir, projectName);
      } else {
        throw new Error(`error hit when installing remote template`);
      }

      ref.path = `${ref.path}/${projectName}`;

      return ref;
    } catch (err) {
      throw new Error(`error hit when instantiating remote template: ${err?.message}`);
    }
  }

  private async installRemoteTemplate(
    generatorName: string,
    npmPackageName: string,
    templateVersion: string
  ): Promise<boolean> {
    this.yeomanEnv.cwd = templateGeneratorPath;
    try {
      log('Installing generator', npmPackageName);
      templateVersion = templateVersion ? templateVersion : '*';
      await this.yeomanEnv.installLocalGenerators({ [npmPackageName]: templateVersion });

      log('Looking up local packages');
      await this.yeomanEnv.lookupLocalPackages();
      return true;
    } catch {
      return false;
    }
  }

  private async instantiateRemoteTemplate(
    generatorName: string,
    dstDir: string,
    projectName: string
  ): Promise<boolean> {
    log('About to instantiate a template!', dstDir, generatorName, projectName);
    this.yeomanEnv.cwd = dstDir;
    process.chdir(dstDir);

    await this.yeomanEnv.run([generatorName, projectName], {}, () => {
      log('Template successfully instantiated', dstDir, generatorName, projectName);
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
        if (json?.version) {
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
          if (json?.version) {
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

  private getFeedType(): FeedType {
    // TODO: parse through data to detect for npm or nuget package schema and return respecive result
    return 'npm';
  }

  private getPackageDisplayName(packageName: string): string {
    if (packageName) {
      return packageName
        .replace('generator-', '')
        .split('-')
        .reduce((a, b) => a.charAt(0).toUpperCase() + a.slice(1) + ' ' + b.charAt(0).toUpperCase() + b.slice(1));
    } else {
      return '';
    }
  }

  private async getFeedContents(feedUrl: string): Promise<BotTemplateV2[] | undefined | null> {
    try {
      const res = await fetch(feedUrl);
      const data = await res.json();
      const feedType = this.getFeedType();
      if (feedType === 'npm') {
        return data.objects.map((result) => {
          const { name, version, description = '', keywords = [] } = result.package;
          const displayName = this.getPackageDisplayName(name);
          return {
            id: name,
            name: displayName,
            description: description,
            keywords: keywords,
            package: {
              packageName: name,
              packageSource: 'npm',
              packageVersion: version,
            },
          } as BotTemplateV2;
        });
      } else if (feedType === 'nuget') {
        // TODO: handle nuget processing
      } else {
        return [];
      }
    } catch (error) {
      return null;
    }
  }

  public async getCustomFeedTemplates(feedUrls: string[]): Promise<BotTemplateV2[]> {
    let templates: BotTemplateV2[] = [];
    const invalidFeedUrls: string[] = [];

    for (const feed of feedUrls) {
      const feedTemplates = await this.getFeedContents(feed);
      if (feedTemplates === null) {
        invalidFeedUrls.push(feed);
      } else if (feedTemplates && Array.isArray(feedTemplates) && feedTemplates.length > 0) {
        templates = templates.concat(feedTemplates);
      }
    }

    return templates;
  }
}
