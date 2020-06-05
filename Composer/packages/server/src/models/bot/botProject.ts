// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { promisify } from 'util';
import fs from 'fs';

import axios from 'axios';
import { autofixReferInDialog } from '@bfc/indexers';
import { getNewDesigner, FileInfo, Skill, Diagnostic } from '@bfc/shared';
import { UserIdentity, pluginLoader } from '@bfc/plugin-loader';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { ISettingManager, OBFUSCATED_VALUE } from '../settings';
import { DefaultSettingManager } from '../settings/defaultSettingManager';
import log from '../../logger';
import { BotProjectService } from '../../services/project';

import { ICrossTrainConfig } from './luPublisher';
import { IFileStorage } from './../storage/interface';
import { LocationRef } from './interface';
import { LuPublisher } from './luPublisher';
import { extractSkillManifestUrl } from './skillManager';
import { DialogSetting } from './interface';

const debug = log.extend('bot-project');
const mkDirAsync = promisify(fs.mkdir);

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

// Define the project structure
const BotStructureTemplate = {
  folder: '',
  entry: '${BOTNAME}.dialog',
  schema: '${FILENAME}',
  settings: 'settings/${FILENAME}',
  common: {
    lg: 'language-generation/${LOCALE}/common.${LOCALE}.lg',
  },
  dialogs: {
    folder: 'dialogs/${DIALOGNAME}',
    entry: '${DIALOGNAME}.dialog',
    lg: 'language-generation/${LOCALE}/${DIALOGNAME}.${LOCALE}.lg',
    lu: 'language-understanding/${LOCALE}/${DIALOGNAME}.${LOCALE}.lu',
  },
  skillManifests: 'manifests/${MANIFESTNAME}.json',
};

const templateInterpolate = (str: string, obj: { [key: string]: string }) =>
  str.replace(/\${([^}]+)}/g, (_, prop) => obj[prop]);

export class BotProject {
  public ref: LocationRef;
  public locale: string;
  // TODO: address need to instantiate id - perhaps do so in constructor based on Store.get(projectLocationMap)
  public id: string | undefined;
  public name: string;
  public dir: string;
  public dataDir: string;
  public files: FileInfo[] = [];
  public fileStorage: IFileStorage;
  public luPublisher: LuPublisher;
  public defaultSDKSchema: {
    [key: string]: string;
  };
  public skills: Skill[] = [];
  public diagnostics: Diagnostic[] = [];
  public settingManager: ISettingManager;
  public settings: DialogSetting | null = null;
  constructor(ref: LocationRef, user?: UserIdentity) {
    this.ref = ref;
    this.locale = 'en-us'; // default to en-us
    this.dir = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dataDir = this.dir;
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));

    this.settingManager = new DefaultSettingManager(this.dir);
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId, user);
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage, this.locale);
  }

  public init = async () => {
    this.diagnostics = [];
    this.settings = await this.getEnvSettings(false);
    const { skillsParsed, diagnostics } = await extractSkillManifestUrl(this.settings?.skill || []);
    this.skills = skillsParsed;
    this.diagnostics.push(...diagnostics);
    this.files = await this._getFiles();
  };

  public getProject = () => {
    return {
      botName: this.name,
      locale: this.locale,
      files: this.files,
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

  // update skill in settings
  public updateSkill = async (config: Skill[]) => {
    const settings = await this.getEnvSettings(false);
    const { skillsParsed } = await extractSkillManifestUrl(config);

    settings.skill = skillsParsed.map(({ manifestUrl, name }) => {
      return { manifestUrl, name };
    });
    await this.settingManager.set(settings);

    this.skills = skillsParsed;
    return skillsParsed;
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
    const diagnostics: string[] = [];

    const userSDKSchemaFile = this.files.find((f) => f.name === 'sdk.schema');

    if (userSDKSchemaFile !== undefined) {
      debug('Customized SDK schema found');
      try {
        sdkSchema = JSON.parse(userSDKSchemaFile.content);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Attempt to parse sdk schema as JSON failed');
        diagnostics.push(`Error in sdk.schema, ${error.message}`);
      }
    }

    return {
      sdk: {
        content: sdkSchema,
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
    const mainDialogFile = this.files.find((file) => !file.relativePath.includes('/') && file.name.endsWith('.dialog'));
    if (!mainDialogFile) return;
    const entryDialogId = name.trim().toLowerCase();
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
    const updatedContent = autofixReferInDialog(entryDialogId, JSON.stringify(content, null, 2));
    await this._updateFile(relativePath, updatedContent);
    // when create/saveAs bot, serialize entry dialog/lg/lu
    const entryPatterns = [
      templateInterpolate(BotStructureTemplate.entry, { BOTNAME: '*' }),
      templateInterpolate(BotStructureTemplate.dialogs.lg, { LOCALE: '*', DIALOGNAME: '*' }),
      templateInterpolate(BotStructureTemplate.dialogs.lu, { LOCALE: '*', DIALOGNAME: '*' }),
    ];
    for (const pattern of entryPatterns) {
      const root = this.dataDir;
      const paths = await this.fileStorage.glob(pattern, root);
      for (const filePath of paths.sort()) {
        const realFilePath = Path.join(root, filePath);
        // skip common file, do not rename.
        if (Path.basename(realFilePath).startsWith('common.')) continue;
        // rename file to new botname
        const targetFilePath = realFilePath.replace(/(.*)\/[^.]*(\..*$)/i, `$1/${entryDialogId}$2`);
        await this.fileStorage.rename(realFilePath, targetFilePath);
      }
    }
  };

  public updateFile = async (name: string, content: string): Promise<string> => {
    if (name === this.settingManager.getFileName()) {
      await this.updateDefaultSlotEnvSettings(JSON.parse(content));
      return new Date().toDateString();
    }
    const file = this.files.find((d) => d.name === name);
    if (file === undefined) {
      throw new Error(`no such file ${name}`);
    }

    const relativePath = file.relativePath;
    const lastModified = await this._updateFile(relativePath, content);
    return lastModified;
  };

  public deleteFile = async (name: string) => {
    if (Path.basename(name, '.dialog') === this.name) {
      throw new Error(`Main dialog can't be removed`);
    }

    const file = this.files.find((d) => d.name === name);
    if (file === undefined) {
      throw new Error(`no such file ${name}`);
    }
    await this._removeFile(file.relativePath);
    await this._cleanUp(file.relativePath);
  };

  public createFile = async (name: string, content = '', dir: string = this.defaultDir(name)) => {
    const file = this.files.find((d) => d.name === name);
    if (file) {
      throw new Error(`${name} dialog already exist`);
    }
    const relativePath = Path.join(dir, name.trim());
    return await this._createFile(relativePath, content);
  };

  public publishLuis = async (authoringKey: string, fileIds: string[] = [], crossTrainConfig: ICrossTrainConfig) => {
    if (fileIds.length && this.settings) {
      const map = fileIds.reduce((result, id) => {
        result[id] = true;
        return result;
      }, {});
      const files = this.files.filter((file) => map[Path.basename(file.name, '.lu')]);
      this.luPublisher.setPublishConfig(
        { ...this.settings.luis, authoringKey },
        crossTrainConfig,
        this.settings.downsampling
      );
      await this.luPublisher.publish(files);
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

  private async removeLocalRuntimeData(projectId) {
    const method = 'localpublish';
    if (pluginLoader.extensions.publish[method]?.methods?.stopBot) {
      const pluginMethod = pluginLoader.extensions.publish[method].methods.stopBot;
      if (typeof pluginMethod === 'function') {
        await pluginMethod.call(null, projectId);
      }
    }
    if (pluginLoader.extensions.publish[method]?.methods?.removeRuntimeData) {
      const pluginMethod = pluginLoader.extensions.publish[method].methods.removeRuntimeData;
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

  private getLocale(id: string): string {
    const index = id.lastIndexOf('.');
    if (~index) return '';
    return id.substring(index + 1);
  }

  private defaultDir = (name: string) => {
    const fileType = Path.extname(name);
    const id = Path.basename(name, fileType);
    const idWithoutLocale = Path.basename(id, `.${this.locale}`);
    const DIALOGNAME = idWithoutLocale;
    const LOCALE = this.getLocale(id) || this.locale;
    const folder = BotStructureTemplate.dialogs.folder;
    let dir = BotStructureTemplate.folder;
    if (fileType === '.dialog') {
      dir = templateInterpolate(Path.dirname(Path.join(folder, BotStructureTemplate.dialogs.entry)), {
        DIALOGNAME,
        LOCALE,
      });
    } else if (fileType === '.lg') {
      dir = templateInterpolate(Path.dirname(Path.join(folder, BotStructureTemplate.dialogs.lg)), {
        DIALOGNAME,
        LOCALE,
      });
    } else if (fileType === '.lu') {
      dir = templateInterpolate(Path.dirname(Path.join(folder, BotStructureTemplate.dialogs.lu)), {
        DIALOGNAME,
        LOCALE,
      });
    } else if (fileType === '.json') {
      dir = templateInterpolate(
        Path.dirname(Path.join(BotStructureTemplate.folder, BotStructureTemplate.skillManifests)),
        {
          MANIFESTNAME: id,
        }
      );
    }
    return dir;
  };

  // create a file with relativePath and content relativePath is a path relative
  // to root dir instead of dataDir dataDir is not aware at this layer
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
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
    this.files.push(file);
    return file;
  };

  // update file in this project this function will gurantee the memory cache
  // (this.files, all indexes) also gets updated
  private _updateFile = async (relativePath: string, content: string) => {
    const index = this.files.findIndex((f) => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;

    // only write if the file has actually changed
    if (this.files[index].content !== content) {
      this.files[index].content = content;
      await this.fileStorage.writeFile(absolutePath, content);
    }

    // TODO: we should get the lastModified from the writeFile operation
    // instead of calling stat again which could be expensive
    const stats = await this.fileStorage.stat(absolutePath);

    return stats.lastModified;
  };

  // remove file in this project this function will gurantee the memory cache
  // (this.files, all indexes) also gets updated
  private _removeFile = async (relativePath: string) => {
    const index = this.files.findIndex((f) => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }
    this.files.splice(index, 1);

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

    const fileList: FileInfo[] = [];
    const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu', 'manifests/*.json'];
    for (const pattern of patterns) {
      // load only from the data dir, otherwise may get "build" versions from
      // deployment process
      const root = this.dataDir;
      const paths = await this.fileStorage.glob([pattern, '!(generated/**)', '!(runtime/**)'], root);

      for (const filePath of paths.sort()) {
        const realFilePath: string = Path.join(root, filePath);
        const fileInfo = await this._getFileInfo(realFilePath);
        if (fileInfo) {
          fileList.push(fileInfo);
        }
      }
    }

    const schemas = await this._getSchemas();
    fileList.push(...schemas);

    return fileList;
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
    const paths = await this.fileStorage.glob('*.schema', schemasDir);

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
}
