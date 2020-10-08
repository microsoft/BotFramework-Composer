// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { promisify } from 'util';
import fs from 'fs';

import axios from 'axios';
import { autofixReferInDialog } from '@bfc/indexers';
import {
  getNewDesigner,
  FileInfo,
  Skill,
  Diagnostic,
  IBotProject,
  DialogSetting,
  FileExtensions,
  convertAbsolutePathToFileProtocol,
} from '@bfc/shared';
import merge from 'lodash/merge';
import { UserIdentity, ExtensionContext } from '@bfc/extension';
import { FeedbackType, generate } from '@microsoft/bf-generate-library';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { getDialogNameFromFile } from '../utilities/util';
import { ISettingManager, OBFUSCATED_VALUE } from '../settings';
import { DefaultSettingManager } from '../settings/defaultSettingManager';
import log from '../../logger';
import { BotProjectService } from '../../services/project';
import AssetService from '../../services/asset';

import { Builder } from './builder';
import { IFileStorage } from './../storage/interface';
import { LocationRef, IBuildConfig } from './interface';
import { retrieveSkillManifests } from './skillManager';
import { defaultFilePath, serializeFiles, parseFileName } from './botStructure';

const debug = log.extend('bot-project');
const mkDirAsync = promisify(fs.mkdir);

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

const defaultLanguage = 'en-us'; // default value for settings.defaultLanguage

export class BotProject implements IBotProject {
  public ref: LocationRef;
  // TODO: address need to instantiate id - perhaps do so in constructor based on Store.get(projectLocationMap)
  public id: string | undefined;
  public name: string;
  public dir: string;
  public dataDir: string;
  public fileStorage: IFileStorage;
  public builder: Builder;
  public defaultSDKSchema: {
    [key: string]: string;
  };
  public defaultUISchema: {
    [key: string]: string;
  };
  public skills: Skill[] = [];
  public diagnostics: Diagnostic[] = [];
  public settingManager: ISettingManager;
  public settings: DialogSetting | null = null;

  private files = new Map<string, FileInfo>();

  constructor(ref: LocationRef, user?: UserIdentity) {
    this.ref = ref;
    this.dir = Path.resolve(this.ref.path); // make sure we switch to posix style after here
    this.dataDir = this.dir;
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));
    this.defaultUISchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.uischema'), 'utf-8'));

    this.settingManager = new DefaultSettingManager(this.dir);
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId, user);
    this.builder = new Builder(this.dir, this.fileStorage, defaultLanguage);
  }

  public get dialogFiles() {
    const files: FileInfo[] = [];
    this.files.forEach((file) => {
      if (file.name.endsWith('.dialog')) {
        files.push(file);
      }
    });

    return files;
  }

  public get botProjectFiles() {
    const files: FileInfo[] = [];
    this.files.forEach((file) => {
      if (file.name.endsWith(FileExtensions.BotProject)) {
        files.push(file);
      }
    });

    return files;
  }

  public get dialogSchemaFiles() {
    const files: FileInfo[] = [];
    this.files.forEach((file) => {
      if (file.name.endsWith('.dialog.schema')) {
        files.push(file);
      }
    });

    return files;
  }

  public get lgFiles() {
    const files: FileInfo[] = [];
    this.files.forEach((file) => {
      if (file.name.endsWith('.lg')) {
        files.push(file);
      }
    });

    return files;
  }

  public get luFiles() {
    const files: FileInfo[] = [];
    this.files.forEach((file) => {
      if (file.name.endsWith('.lu')) {
        files.push(file);
      }
    });

    return files;
  }

  public get schema() {
    return this.files.get('sdk.schema');
  }

  public get uiSchema() {
    return this.files.get('sdk.uischema');
  }

  public get uiSchemaOverrides() {
    return this.files.get('sdk.override.uischema');
  }

  public get schemaOverrides() {
    return this.files.get('sdk.override.schema');
  }

  public getFile(id: string) {
    return this.files.get(id);
  }

  public init = async () => {
    this.diagnostics = [];
    this.settings = await this.getEnvSettings(false);
    const { skillManifests, diagnostics } = await retrieveSkillManifests(this.settings?.skill);
    this.skills = skillManifests;
    this.diagnostics.push(...diagnostics);
    this.files = await this._getFiles();
  };

  public getProject = () => {
    return {
      botName: this.name,
      files: Array.from(this.files.values()),
      location: this.dir,
      schemas: this.getSchemas(),
      skills: this.skills,
      diagnostics: this.diagnostics,
      settings: this.settings,
    };
  };

  public getDefaultSlotEnvSettings = async (obfuscate: boolean) => {
    return await this.settingManager.get(obfuscate);
  };

  public getEnvSettings = async (obfuscate: boolean) => {
    const settings = await this.settingManager.get(obfuscate);

    // fix old bot have no language settings
    if (!settings?.defaultLanguage) {
      settings.defaultLanguage = defaultLanguage;
    }

    if (!settings?.languages) {
      settings.languages = [defaultLanguage];
    }

    // migrate to qna.endpointKey
    if (settings?.qna && typeof settings.qna.endpointkey === 'string') {
      // if endpointKey has not been set, migrate old key to new key
      if (!settings.qna.endpointKey) {
        settings.qna.endpointKey = settings.qna.endpointkey;
      }
      delete settings.qna.endpointkey;
      await this.updateEnvSettings(settings);
    }

    // set these after migrating qna settings to not write them to storage
    if (settings && oauthInput().MicrosoftAppId && oauthInput().MicrosoftAppId !== OBFUSCATED_VALUE) {
      settings.MicrosoftAppId = oauthInput().MicrosoftAppId;
    }

    if (settings && oauthInput().MicrosoftAppPassword && oauthInput().MicrosoftAppPassword !== OBFUSCATED_VALUE) {
      settings.MicrosoftAppPassword = oauthInput().MicrosoftAppPassword;
    }

    return settings;
  };

  public updateDefaultSlotEnvSettings = async (config: DialogSetting) => {
    await this.updateEnvSettings(config);
  };

  // create or update dialog settings
  public updateEnvSettings = async (config: DialogSetting) => {
    await this.settingManager.set(config);
    this.settings = config;
  };

  public exportToZip = (cb) => {
    try {
      this.fileStorage.zip(this.dataDir, cb);
    } catch (e) {
      debug('error zipping assets', e);
    }
  };

  public getSchemas = () => {
    let sdkSchema = this.defaultSDKSchema;
    let uiSchema = this.defaultUISchema;
    let uiSchemaOverrides = {};
    let schemaOverrides = {};
    const diagnostics: string[] = [];

    const userSDKSchemaFile = this.schema;

    if (userSDKSchemaFile !== undefined) {
      debug('Customized SDK schema found');
      try {
        sdkSchema = JSON.parse(userSDKSchemaFile.content);
      } catch (err) {
        debug('Attempt to parse sdk schema as JSON failed.\nError: %s', err.messagee);
        diagnostics.push(`Error in sdk.schema, ${err.message}`);
      }
    }

    const uiSchemaFile = this.uiSchema;

    if (uiSchemaFile !== undefined) {
      debug('UI Schema found.');
      try {
        uiSchema = merge(uiSchema, JSON.parse(uiSchemaFile.content));
      } catch (err) {
        debug('Attempt to parse ui schema as JSON failed.\nError: %s', err.messagee);
        diagnostics.push(`Error in sdk.uischema, ${err.message}`);
      }
    }

    const schemaOverridesFile = this.schemaOverrides;

    if (schemaOverridesFile !== undefined) {
      debug('Schema overrides found.');
      try {
        schemaOverrides = JSON.parse(schemaOverridesFile.content);
      } catch (err) {
        debug('Attempt to parse schema as JSON failed.\nError: %s', err.messagee);
        diagnostics.push(`Error in sdk.override.schema, ${err.message}`);
      }
    }

    const uiSchemaOverridesFile = this.uiSchemaOverrides;

    if (uiSchemaOverridesFile !== undefined) {
      debug('UI Schema overrides found.');
      try {
        uiSchemaOverrides = JSON.parse(uiSchemaOverridesFile.content);
      } catch (err) {
        debug('Attempt to parse ui schema as JSON failed.\nError: %s', err.messagee);
        diagnostics.push(`Error in sdk.override.uischema, ${err.message}`);
      }
    }

    return {
      sdk: {
        content: merge(sdkSchema, schemaOverrides),
      },
      ui: {
        content: uiSchema,
      },
      uiOverrides: {
        content: uiSchemaOverrides,
      },
      default: this.defaultSDKSchema,
      diagnostics,
    };
  };

  public async saveSchemaToProject(schemaUrl, pathToSave) {
    try {
      const response = await axios({
        method: 'get',
        url: schemaUrl,
        responseType: 'stream',
      });
      const dirToSchema = `${pathToSave}/schemas`;
      await mkDirAsync(dirToSchema);
      const writer = fs.createWriteStream(`${dirToSchema}/sdk.schema`);

      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve();
          }
        });
      });
    } catch (ex) {
      debug(`Custom Schema download error: ${ex}`);
      throw new Error('Schema file could not be downloaded. Please check the url to the schema.');
    }
  }

  public updateBotInfo = async (name: string, description: string) => {
    const mainDialogFile = this.dialogFiles.find((file) => !file.relativePath.includes('/'));
    if (!mainDialogFile) return;
    const botName = name.trim().toLowerCase();
    const { relativePath } = mainDialogFile;
    const content = JSON.parse(mainDialogFile.content);
    if (!content.$designer) return;
    const oldDesigner = content.$designer;
    let newDesigner;
    if (oldDesigner && oldDesigner.id) {
      newDesigner = {
        ...oldDesigner,
        name,
        description,
      };
    } else {
      newDesigner = getNewDesigner(name, description);
    }
    content.$designer = newDesigner;
    content.id = name;
    const updatedContent = autofixReferInDialog(botName, JSON.stringify(content, null, 2));
    await this._updateFile(relativePath, updatedContent);

    for (const botProjectFile of this.botProjectFiles) {
      const { relativePath } = botProjectFile;
      const content = JSON.parse(botProjectFile.content);
      content.workspace = convertAbsolutePathToFileProtocol(this.dataDir);
      content.name = botName;
      await this._updateFile(relativePath, JSON.stringify(content, null, 2));
    }
    await serializeFiles(this.fileStorage, this.dataDir, botName);
  };

  public updateFile = async (name: string, content: string): Promise<string> => {
    if (name === this.settingManager.getFileName()) {
      await this.updateDefaultSlotEnvSettings(JSON.parse(content));
      return new Date().toDateString();
    }
    const file = this.files.get(name);
    if (file === undefined) {
      throw new Error(`no such file ${name}`);
    }

    const relativePath = file.relativePath;
    this._validateFileContent(name, content);
    const lastModified = await this._updateFile(relativePath, content);
    return lastModified;
  };

  public deleteFile = async (name: string) => {
    if (Path.basename(name, '.dialog') === this.name) {
      throw new Error(`Main dialog can't be removed`);
    }

    const file = this.files.get(name);
    if (file === undefined) {
      throw new Error(`no such file ${name}`);
    }
    await this._removeFile(file.relativePath);
    await this._cleanUp(file.relativePath);
  };

  public deleteFiles = async (files) => {
    for (const { name } of files) {
      await this.deleteFile(name);
    }
  };

  public validateFileName = (name: string) => {
    const nameRegex = /^[a-zA-Z0-9-_]+$/;
    const { fileId, fileType } = parseFileName(name, '');

    let fileName = fileId;
    if (fileType === '.dialog') {
      fileName = Path.basename(name, fileType);
    }

    if (!fileName) {
      throw new Error('The file name can not be empty');
    }

    if (!nameRegex.test(fileName)) {
      throw new Error('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
    }
  };

  public createFile = async (name: string, content = '') => {
    const filename = name.trim();
    this.validateFileName(filename);
    this._validateFileContent(name, content);
    const botName = this.name;
    const defaultLocale = this.settings?.defaultLanguage || defaultLanguage;
    const relativePath = defaultFilePath(botName, defaultLocale, filename);
    const file = this.files.get(filename);
    if (file) {
      throw new Error(`${filename} dialog already exist`);
    }
    return await this._createFile(relativePath, content);
  };

  public createFiles = async (files) => {
    const createdFiles: any = [];
    for (const { name, content } of files) {
      const file = await this.createFile(name, content);
      createdFiles.push(file);
    }
    return createdFiles;
  };

  public buildFiles = async ({
    luisConfig,
    qnaConfig,
    luFileIds = [],
    qnaFileIds = [],
    crossTrainConfig,
  }: IBuildConfig) => {
    if ((luFileIds.length || qnaFileIds.length) && this.settings) {
      const luFiles: FileInfo[] = [];
      luFileIds.forEach((id) => {
        const f = this.files.get(`${id}.lu`);
        if (f) {
          luFiles.push(f);
        }
      });
      const qnaFiles: FileInfo[] = [];
      qnaFileIds.forEach((id) => {
        const f = this.files.get(`${id}.qna`);
        if (f) {
          qnaFiles.push(f);
        }
      });
      this.builder.setBuildConfig(
        { ...luisConfig, subscriptionKey: qnaConfig.subscriptionKey, qnaRegion: qnaConfig.qnaRegion },
        crossTrainConfig,
        this.settings.downsampling
      );
      await this.builder.build(luFiles, qnaFiles);
    }
  };

  public cloneFiles = async (locationRef: LocationRef): Promise<LocationRef> => {
    // get destination storage client
    const dstStorage = StorageService.getStorageClient(locationRef.storageId);
    // ensure saveAs path isn't existed in dst storage, in order to cover or mess up
    // existed bot proj
    if (await dstStorage.exists(locationRef.path)) {
      throw new Error(`Folder ${locationRef.path} already exists.`);
    }
    const dstDir = locationRef.path;
    await dstStorage.mkDir(dstDir, { recursive: true });

    await copyDir(this.dir, this.fileStorage, dstDir, dstStorage);

    return locationRef;
  };

  public copyTo = async (locationRef: LocationRef, user?: UserIdentity) => {
    const newProjRef = await this.cloneFiles(locationRef);
    return new BotProject(newProjRef, user);
  };

  public async exists(): Promise<boolean> {
    return (await this.fileStorage.exists(this.dir)) && (await this.fileStorage.stat(this.dir)).isDir;
  }

  public async deleteAllFiles(): Promise<boolean> {
    try {
      await this.fileStorage.rmrfDir(this.dir);
      const projectId = await BotProjectService.getProjectIdByPath(this.dir);
      if (projectId) {
        await this.removeLocalRuntimeData(projectId);
      }
      await BotProjectService.cleanProject({ storageId: 'default', path: this.dir });
      await BotProjectService.deleteRecentProject(this.dir);
    } catch (e) {
      throw new Error(e);
    }
    return true;
  }

  // update qna endpointKey in settings
  public updateQnaEndpointKey = async (subscriptionKey: string) => {
    const qnaEndpointKey = await this.builder.getQnaEndpointKey(subscriptionKey, {
      ...this.settings?.luis,
      qnaRegion: this.settings?.qna.qnaRegion || this.settings?.luis.authoringRegion,
      subscriptionKey,
    });
    return qnaEndpointKey;
  };

  public async generateDialog(name: string) {
    const defaultLocale = this.settings?.defaultLanguage || defaultLanguage;
    const relativePath = defaultFilePath(this.name, defaultLocale, `${name}${FileExtensions.FormDialogSchema}`);
    const schemaPath = Path.resolve(this.dir, relativePath);

    const dialogPath = defaultFilePath(this.name, defaultLocale, `${name}${FileExtensions.Dialog}`);
    const outDir = Path.dirname(Path.resolve(this.dir, dialogPath));

    const feedback = (type: FeedbackType, message: string): void => {
      // eslint-disable-next-line no-console
      console.log(`${type} - ${message}`);
    };

    const generateParams = {
      schemaPath,
      prefix: name,
      outDir,
      metaSchema: undefined,
      allLocales: undefined,
      templateDirs: [],
      force: false,
      merge: true,
      singleton: true,
      feedback,
    };

    // schema path = path to the JSON schema file defining the form data
    // prefix - the dialog name to prefix on generated assets
    // outDir - the directory where the dialog assets will be saved
    // metaSchema - deprecated
    // allLocales - the additional locales for which to generate assets
    // templateDirs - paths to directories containing customized templates
    // force - if assets are overwritten causing any user customizations to be lost
    // merge - if generated assets should be merged with any user customized assets
    // singleton - if the generated assets should be merged into a single dialog
    // feeback - a callback for status and progress and generation happens
    await generate(
      generateParams.schemaPath,
      generateParams.prefix,
      generateParams.outDir,
      generateParams.metaSchema,
      generateParams.allLocales,
      generateParams.templateDirs,
      generateParams.force,
      generateParams.merge,
      generateParams.singleton,
      generateParams.feedback
    );
  }

  private async removeLocalRuntimeData(projectId) {
    const method = 'localpublish';
    if (ExtensionContext.extensions.publish[method]?.methods?.stopBot) {
      const pluginMethod = ExtensionContext.extensions.publish[method].methods.stopBot;
      if (typeof pluginMethod === 'function') {
        await pluginMethod.call(null, projectId);
      }
    }

    if (ExtensionContext.extensions.publish[method]?.methods?.removeRuntimeData) {
      const pluginMethod = ExtensionContext.extensions.publish[method].methods.removeRuntimeData;
      if (typeof pluginMethod === 'function') {
        await pluginMethod.call(null, projectId);
      }
    }
  }

  private _cleanUp = async (relativePath: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    const dirPath = Path.dirname(absolutePath);
    await this._removeEmptyFolderFromBottomToUp(dirPath, this.dataDir);
  };

  private _removeEmptyFolderFromBottomToUp = async (folderPath: string, prefix: string) => {
    let currentFolder = folderPath;
    //make sure the folder to delete is in current project
    while (currentFolder.startsWith(prefix)) {
      await this._removeEmptyFolder(currentFolder);
      currentFolder = Path.dirname(currentFolder);
    }
  };

  private _removeEmptyFolder = async (folderPath: string) => {
    const files = await this.fileStorage.readDir(folderPath);
    if (files.length === 0) {
      try {
        await this.fileStorage.rmDir(folderPath);
      } catch (e) {
        // pass
      }
    }
  };

  // create a file with relativePath and content relativePath is a path relative
  // to root dir instead of dataDir dataDir is not aware at this layer
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
    if (!absolutePath.startsWith(this.dir)) {
      throw new Error('Cannot create file outside of current project folder');
    }
    await this.ensureDirExists(Path.dirname(absolutePath));
    debug('Creating file: %s', absolutePath);
    await this.fileStorage.writeFile(absolutePath, content);

    // TODO: we should get the lastModified from the writeFile operation
    // instead of calling stat again which could be expensive
    const stats = await this.fileStorage.stat(absolutePath);

    const file = {
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
      lastModified: stats.lastModified,
    };

    // update this.files which is memory cache of all files
    this.files.set(file.name, file);
    return file;
  };

  // update file in this project this function will guarantee the memory cache
  // (this.files, all indexes) also gets updated
  private _updateFile = async (relativePath: string, content: string) => {
    const file = this.files.get(Path.basename(relativePath));
    if (!file) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;
    if (!absolutePath.startsWith(this.dir)) {
      throw new Error('Cannot update file outside of current project folder');
    }
    // only write if the file has actually changed
    if (file.content !== content) {
      file.content = content;
      await this.fileStorage.writeFile(absolutePath, content);
    }

    // TODO: we should get the lastModified from the writeFile operation
    // instead of calling stat again which could be expensive
    const stats = await this.fileStorage.stat(absolutePath);

    return stats.lastModified;
  };

  // remove file in this project this function will guarantee the memory cache
  // (this.files, all indexes) also gets updated
  private _removeFile = async (relativePath: string) => {
    const name = Path.basename(relativePath);
    if (!this.files.has(name)) {
      throw new Error(`no such file at ${relativePath}`);
    }
    this.files.delete(name);

    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.removeFile(absolutePath);
  };
  // ensure dir exist, dir is a absolute dir path
  private ensureDirExists = async (dir: string) => {
    if (!dir || dir === '.') {
      return;
    }
    if (!(await this.fileStorage.exists(dir))) {
      debug('Creating directory: %s', dir);
      await this.fileStorage.mkDir(dir, { recursive: true });
    }
  };

  private _getFiles = async () => {
    if (!(await this.exists())) {
      throw new Error(`${this.dir} is not a valid path`);
    }

    const fileList = new Map<string, FileInfo>();
    const patterns = [
      '**/*.dialog',
      '**/*.dialog.schema',
      '**/*.lg',
      '**/*.lu',
      '**/*.qna',
      'manifests/*.json',
      'sdk.override.schema',
      'sdk.override.uischema',
      'sdk.schema',
      'sdk.uischema',
      '*.botproj',
    ];
    for (const pattern of patterns) {
      // load only from the data dir, otherwise may get "build" versions from
      // deployment process
      const root = this.dataDir;
      const paths = await this.fileStorage.glob([pattern, '!(generated/**)', '!(runtime/**)'], root);

      for (const filePath of paths.sort()) {
        const realFilePath: string = Path.join(root, filePath);
        const fileInfo = await this._getFileInfo(realFilePath);
        if (fileInfo) {
          if (fileList.has(fileInfo.name)) {
            throw new Error(`duplicate file found: ${fileInfo.relativePath}`);
          }
          fileList.set(fileInfo.name, fileInfo);
        }
      }
    }

    const schemas = await this._getSchemas();
    schemas.forEach((file) => {
      if (fileList.has(file.name)) {
        throw new Error(`duplicate file found: ${file.relativePath}`);
      }
      fileList.set(file.name, file);
    });

    const migrationFilesList = await Promise.all([
      this._createQnAFilesForOldBot(fileList),
      this._createBotProjectFileForOldBots(fileList),
    ]);

    const files = [...fileList];
    migrationFilesList.forEach((migrationFiles) => {
      files.push(...migrationFiles);
    });
    return new Map<string, FileInfo>(files);
  };

  // migration: create qna files for old bots
  private _createQnAFilesForOldBot = async (files: Map<string, FileInfo>) => {
    const dialogFiles: FileInfo[] = [];
    const qnaFiles: FileInfo[] = [];
    files.forEach((file) => {
      if (file.name.endsWith('.dialog')) {
        dialogFiles.push(file);
      }
      if (file.name.endsWith('.qna')) {
        qnaFiles.push(file);
      }
    });

    const dialogNames = dialogFiles.map((file) => getDialogNameFromFile(file.name));
    const qnaNames = qnaFiles.map((file) => getDialogNameFromFile(file.name));
    const fileList = new Map<string, FileInfo>();
    for (let i = 0; i < dialogNames.length; i++) {
      if (!qnaNames || qnaNames.length === 0 || !qnaNames.find((qn) => qn === dialogNames[i])) {
        await this.createFile(`${dialogNames[i]}.qna`, '');
      }
    }

    const pattern = '**/*.qna';
    // load only from the data dir, otherwise may get "build" versions from
    // deployment process
    const root = this.dataDir;
    const paths = await this.fileStorage.glob([pattern, '!(generated/**)', '!(runtime/**)'], root);

    for (const filePath of paths.sort()) {
      const realFilePath: string = Path.join(root, filePath);
      const fileInfo = await this._getFileInfo(realFilePath);
      if (fileInfo) {
        fileList.set(fileInfo.name, fileInfo);
      }
    }
    return fileList;
  };

  private _createBotProjectFileForOldBots = async (files: Map<string, FileInfo>) => {
    const fileList = new Map<string, FileInfo>();
    try {
      const defaultBotProjectFile: any = await AssetService.manager.botProjectFileTemplate;

      for (const [_, file] of files) {
        if (file.name.endsWith(FileExtensions.BotProject)) {
          return fileList;
        }
      }
      const fileName = `${this.name}${FileExtensions.BotProject}`;
      const root = this.dataDir;

      defaultBotProjectFile.workspace = convertAbsolutePathToFileProtocol(root);
      defaultBotProjectFile.name = this.name;

      await this._createFile(fileName, JSON.stringify(defaultBotProjectFile, null, 2));
      const pathToBotProject: string = Path.join(root, fileName);
      const fileInfo = await this._getFileInfo(pathToBotProject);

      if (fileInfo) {
        fileList.set(fileInfo.name, fileInfo);
      }
      return fileList;
    } catch (ex) {
      return fileList;
    }
  };

  private _getSchemas = async (): Promise<FileInfo[]> => {
    if (!(await this.exists())) {
      throw new Error(`${this.dir} is not a valid path`);
    }

    const schemasDir = Path.join(this.dir, 'schemas');

    if (!(await this.fileStorage.exists(schemasDir))) {
      debug('No schemas directory found.');
      return [];
    }

    debug('Schemas directory found.');
    const schemas: FileInfo[] = [];
    const paths = await this.fileStorage.glob('*.{uischema,schema}', schemasDir);

    for (const path of paths) {
      const fileInfo = await this._getFileInfo(Path.join(schemasDir, path));
      if (fileInfo) {
        schemas.push(fileInfo);
      }
    }

    return schemas;
  };

  private _getFileInfo = async (path: string): Promise<FileInfo | undefined> => {
    const stats = await this.fileStorage.stat(path);
    if (stats.isFile) {
      const content: string = await this.fileStorage.readFile(path);
      return {
        name: Path.basename(path),
        content: content,
        path: path,
        relativePath: Path.relative(this.dir, path),
        lastModified: stats.lastModified,
      };
    }
  };

  private _validateFileContent = (name: string, content: string) => {
    const extension = Path.extname(name);
    if (extension === '.dialog' || name === 'appsettings.json') {
      try {
        const parsedContent = JSON.parse(content);
        if (typeof parsedContent !== 'object' || Array.isArray(parsedContent)) {
          throw new Error('Invalid file content');
        }
      } catch (e) {
        throw new Error('Invalid file content');
      }
    }
  };
}
