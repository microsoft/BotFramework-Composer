// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import { getNewDesigner } from '@bfc/shared';
import {
  FileInfo,
  DialogInfo,
  LgFile,
  LuFile,
  dialogIndexer,
  lgIndexer,
  luIndexer,
  createSingleMessage,
} from '@bfc/indexers';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IEnvironment, EnvironmentProvider } from '../environment';
import { ISettingManager, OBFUSCATED_VALUE } from '../settings';
import log from '../../logger';

import { IFileStorage } from './../storage/interface';
import { LocationRef, LuisStatus, FileUpdateType } from './interface';
import { LuPublisher } from './luPublisher';
import { DialogSetting } from './interface';

const debug = log.extend('bot-project');
const DIALOGFOLDER = 'ComposerDialogs';

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

export class BotProject {
  public ref: LocationRef;

  public name: string;
  public dir: string;
  public dataDir: string;
  public files: FileInfo[] = [];
  public fileStorage: IFileStorage;
  public dialogs: DialogInfo[] = [];
  public luFiles: LuFile[] = [];
  public lgFiles: LgFile[] = [];
  public luPublisher: LuPublisher;
  public defaultSDKSchema: {
    [key: string]: string;
  };
  public defaultEditorSchema: {
    [key: string]: string;
  };
  public environment: IEnvironment;
  public settingManager: ISettingManager;
  public settings: DialogSetting | null = null;
  constructor(ref: LocationRef) {
    this.ref = ref;
    this.dir = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dataDir = Path.join(this.dir, DIALOGFOLDER);
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));
    this.defaultEditorSchema = JSON.parse(
      fs.readFileSync(Path.join(__dirname, '../../../schemas/editor.schema'), 'utf-8')
    );

    this.environment = EnvironmentProvider.getCurrentWithOverride({ basePath: this.dir });
    this.settingManager = this.environment.getSettingsManager();
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
  }

  public index = async () => {
    this.files = await this._getFiles();
    this.settings = await this.getEnvSettings(this.environment.getDefaultSlot(), false);
    this.dialogs = this.indexDialog();
    this.lgFiles = lgIndexer.index(this.files);
    this.luFiles = luIndexer.index(this.files);
    await this._checkProjectStructure();
    if (this.settings) {
      await this.luPublisher.setLuisConfig(this.settings.luis);
    }
    await this.luPublisher.loadStatus(this.luFiles.map(f => f.relativePath));
  };

  public getIndexes = () => {
    return {
      botName: this.name,
      location: this.dir,
      dialogs: this.dialogs,
      lgFiles: this.lgFiles,
      luFiles: this.mergeLuStatus(this.luFiles, this.luPublisher.status),
      schemas: this.getSchemas(),
      botEnvironment: this.environment.getEnvironmentName(this.name),
      settings: this.settings,
    };
  };

  public getDefaultSlotEnvSettings = async (obfuscate: boolean) => {
    const defaultSlot = this.environment.getDefaultSlot();
    return await this.settingManager.get(defaultSlot, obfuscate);
  };

  public getEnvSettings = async (slot: string, obfuscate: boolean) => {
    const settings = await this.settingManager.get(slot, obfuscate);
    if (settings && oauthInput().MicrosoftAppId && oauthInput().MicrosoftAppId !== OBFUSCATED_VALUE) {
      settings.MicrosoftAppId = oauthInput().MicrosoftAppId;
    }
    if (settings && oauthInput().MicrosoftAppPassword && oauthInput().MicrosoftAppPassword !== OBFUSCATED_VALUE) {
      settings.MicrosoftAppPassword = oauthInput().MicrosoftAppPassword;
    }
    return settings;
  };

  public updateDefaultSlotEnvSettings = async (config: DialogSetting) => {
    const defaultSlot = this.environment.getDefaultSlot();
    await this.updateEnvSettings(defaultSlot, config);
  };

  // create or update dialog settings
  public updateEnvSettings = async (slot: string, config: DialogSetting) => {
    await this.settingManager.set(slot, config);
    await this.luPublisher.setLuisConfig(config.luis);
  };

  // merge the status managed by luPublisher to the LuFile structure to keep a
  // unified interface
  private mergeLuStatus = (
    luFiles: LuFile[],
    luStatus: {
      [key: string]: LuisStatus;
    }
  ) => {
    return luFiles.map(x => {
      if (!luStatus[x.relativePath]) {
        throw new Error(`No luis status for lu file ${x.relativePath}`);
      }
      return {
        ...x,
        status: luStatus[x.relativePath],
      };
    });
  };

  public getSchemas = () => {
    let editorSchema = this.defaultEditorSchema;
    let sdkSchema = this.defaultSDKSchema;
    const diagnostics: string[] = [];

    const userEditorSchemaFile = this.files.find(f => f.name === 'editor.schema');
    const userSDKSchemaFile = this.files.find(f => f.name === 'sdk.schema');

    if (userEditorSchemaFile !== undefined) {
      try {
        editorSchema = JSON.parse(userEditorSchemaFile.content);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Attempt to parse editor schema as JSON failed');
        diagnostics.push(`Error in editor.schema, ${error.message}`);
      }
    }

    if (userSDKSchemaFile !== undefined) {
      try {
        sdkSchema = JSON.parse(userSDKSchemaFile.content);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Attempt to parse sdk schema as JSON failed');
        diagnostics.push(`Error in sdk.schema, ${error.message}`);
      }
    }

    return {
      editor: {
        content: editorSchema,
      },
      sdk: {
        content: sdkSchema,
      },
      diagnostics,
    };
  };

  public updateBotInfo = async (name: string, description: string) => {
    const dialogs = this.dialogs;
    const mainDialog = dialogs.find(item => item.isRoot);

    if (mainDialog && mainDialog.content) {
      const oldDesigner = mainDialog.content.$designer;

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

      mainDialog.content.$designer = newDesigner;
      await this.updateDialog('Main', mainDialog.content);
    }
  };

  public updateDialog = async (id: string, dialogContent: any): Promise<DialogInfo[]> => {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }

    const relativePath = dialog.relativePath;
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    await this._updateFile(relativePath, content);

    return this.dialogs;
  };

  public createDialog = async (id: string, content = '', dir: string = this.defaultDir(id)): Promise<DialogInfo[]> => {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      throw new Error(`${id} dialog already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.dialog`);
    await this._createFile(relativePath, content);
    return this.dialogs;
  };

  public removeDialog = async (id: string): Promise<DialogInfo[]> => {
    if (id === 'Main') {
      throw new Error(`Main dialog can't be removed`);
    }

    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }
    await this._removeFile(dialog.relativePath);
    this._cleanUp(dialog.relativePath);
    return this.dialogs;
  };

  public updateLgFile = async (id: string, content: string): Promise<LgFile[]> => {
    const lgFile = this.lgFiles.find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._updateFile(lgFile.relativePath, content);
    return this.lgFiles;
  };

  public createLgFile = async (id: string, content: string, dir: string = this.defaultDir(id)): Promise<LgFile[]> => {
    const lgFile = this.lgFiles.find(lg => lg.id === id);
    if (lgFile) {
      throw new Error(`${id} lg file already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    await this._createFile(relativePath, content);
    return this.lgFiles;
  };

  public removeLgFile = async (id: string): Promise<LgFile[]> => {
    const lgFile = this.lgFiles.find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._removeFile(lgFile.relativePath);
    return this.lgFiles;
  };

  public updateLuFile = async (id: string, content: string): Promise<LuFile[]> => {
    const luFile = this.luFiles.find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }

    await this._updateFile(luFile.relativePath, content);
    await this.luPublisher.onFileChange(luFile.relativePath, FileUpdateType.UPDATE);

    return this.mergeLuStatus(this.luFiles, this.luPublisher.status);
  };

  public createLuFile = async (id: string, content: string, dir: string = this.defaultDir(id)): Promise<LuFile[]> => {
    const luFile = this.luFiles.find(lu => lu.id === id);
    if (luFile) {
      throw new Error(`${id} lu file already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.lu`);

    // TODO: validate before save
    await this._createFile(relativePath, content);
    await this.luPublisher.onFileChange(relativePath, FileUpdateType.CREATE); // let publisher know that some files changed
    return this.mergeLuStatus(this.luFiles, this.luPublisher.status); // return a merged LUFile always
  };

  public removeLuFile = async (id: string): Promise<LuFile[]> => {
    const luFile = this.luFiles.find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }

    await this._removeFile(luFile.relativePath);

    await this.luPublisher.onFileChange(luFile.relativePath, FileUpdateType.DELETE);
    await this._cleanUp(luFile.relativePath);
    return this.mergeLuStatus(this.luFiles, this.luPublisher.status);
  };

  public publishLuis = async (authoringKey: string) => {
    this.luPublisher.setAuthoringKey(authoringKey);
    const referred = this.luFiles.filter(this.isReferred);
    const unpublished = this.luPublisher.getUnpublisedFiles(referred);

    const invalidLuFile = unpublished.filter(file => file.diagnostics.length !== 0);
    if (invalidLuFile.length !== 0) {
      const msg = this.generateErrorMessage(invalidLuFile);
      throw new Error(`The Following LuFile(s) are invalid: \n` + msg);
    }
    const emptyLuFiles = unpublished.filter(this.isLuFileEmpty);
    if (emptyLuFiles.length !== 0) {
      const msg = emptyLuFiles.map(file => file.id).join(' ');
      throw new Error(`You have the following empty LuFile(s): ` + msg);
    }

    if (unpublished.length > 0) {
      await this.luPublisher.publish(unpublished);
    }

    return this.mergeLuStatus(this.luFiles, this.luPublisher.status);
  };

  public checkLuisPublished = () => {
    const referredLuFiles = this.luFiles.filter(this.isReferred);
    if (referredLuFiles.length <= 0) {
      return true;
    } else {
      return this.luPublisher.checkLuisPublised(referredLuFiles);
    }
  };

  public cloneFiles = async (locationRef: LocationRef): Promise<LocationRef> => {
    // get destination storage client
    const dstStorage = StorageService.getStorageClient(locationRef.storageId);
    // ensure saveAs path isn't existed in dst storage, in order to cover or mess up
    // existed bot proj
    if (await dstStorage.exists(locationRef.path)) {
      throw new Error('already have this folder, please give another name');
    }
    const dstDir = locationRef.path;
    await dstStorage.mkDir(dstDir, { recursive: true });

    await copyDir(this.dir, this.fileStorage, dstDir, dstStorage);

    return locationRef;
  };

  public copyTo = async (locationRef: LocationRef) => {
    const newProjRef = await this.cloneFiles(locationRef);
    return new BotProject(newProjRef);
  };

  public async exists(): Promise<boolean> {
    return (await this.fileStorage.exists(this.dir)) && (await this.fileStorage.stat(this.dir)).isDir;
  }

  private _cleanUp = async (relativePath: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    const dirPath = Path.dirname(absolutePath);
    await this._removeEmptyFolder(dirPath);
  };

  private _removeEmptyFolder = async (folderPath: string) => {
    const files = await this.fileStorage.readDir(folderPath);
    if (files.length === 0) {
      await this.fileStorage.rmDir(folderPath);
    }
  };

  private defaultDir = (id: string) => Path.join(DIALOGFOLDER, id);

  // create a file with relativePath and content relativePath is a path relative
  // to root dir instead of dataDir dataDir is not aware at this layer
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
    await this.ensureDirExists(Path.dirname(absolutePath));
    debug('Creating file: %s', absolutePath);
    await this.fileStorage.writeFile(absolutePath, content);

    // update this.files which is memory cache of all files
    this.files.push({
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
    });

    await this.reindex(relativePath);
  };

  // update file in this project this function will gurantee the memory cache
  // (this.files, all indexes) also gets updated
  private _updateFile = async (relativePath: string, content: string) => {
    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.writeFile(absolutePath, content);

    this.files[index].content = content;
    await this.reindex(relativePath);
  };

  // remove file in this project this function will gurantee the memory cache
  // (this.files, all indexes) also gets updated
  private _removeFile = async (relativePath: string) => {
    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.removeFile(absolutePath);

    this.files.splice(index, 1);
    await this.reindex(relativePath);
  };

  private indexDialog() {
    return dialogIndexer.index(this.files, this.name, this.getSchemas().sdk.content);
  }

  // re index according to file change in a certain path
  private reindex = async (filePath: string) => {
    const fileExtension = Path.extname(filePath);
    // only call the specific indexer to re-index
    switch (fileExtension) {
      case '.dialog':
        this.dialogs = this.indexDialog();
        break;
      case '.lg':
        this.lgFiles = lgIndexer.index(this.files);
        break;
      case '.lu':
        this.luFiles = luIndexer.index(this.files);
        break;
      default:
        throw new Error(`${filePath} is not dialog or lg or lu file`);
    }
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
    const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu', '**/*.schema'];
    for (const pattern of patterns) {
      // load only from the data dir, otherwise may get "build" versions from
      // deployment process
      const root = this.dataDir;
      const paths = await this.fileStorage.glob(pattern, root);

      for (const filePath of paths.sort()) {
        const realFilePath: string = Path.join(root, filePath);
        // skip lg files for now
        if ((await this.fileStorage.stat(realFilePath)).isFile) {
          const content: string = await this.fileStorage.readFile(realFilePath);
          fileList.push({
            name: Path.basename(filePath),
            content: content,
            path: realFilePath,
            relativePath: Path.relative(this.dir, realFilePath),
          });
        }
      }
    }

    return fileList;
  };

  // check project stracture is valid or not, if not, try fix it.
  private _checkProjectStructure = async () => {
    const dialogs: DialogInfo[] = this.dialogs;
    const luFiles: LuFile[] = this.luFiles;
    const lgFiles: LgFile[] = this.lgFiles;

    // ensure each dialog folder have a lu file, e.g.
    /**
     * + AddToDo (folder)
     *   - AddToDo.dialog
     *   - AddToDo.lu                     // if not exist, auto create it
     */
    for (const dialog of dialogs) {
      // dialog/lu should in the same path folder
      const targetLuFilePath = dialog.relativePath.replace(new RegExp(/\.dialog$/), '.lu');
      const exist = luFiles.findIndex((luFile: LuFile) => luFile.relativePath === targetLuFilePath);
      if (exist === -1) {
        await this._createFile(targetLuFilePath, '');
      }
    }

    // ensure dialog referred *.lg, *.lu exist, e.g
    /**
     * ## AddToDo.dialog (file)
     * {
     *    "generator": "ToDoLuisBot.lg",  // must exist
     *    "recognizer": "foo.lu",         // must exist
     * }
     */
    for (const dialog of dialogs) {
      const { lgFile, luFile } = dialog;
      const lgExist = lgFiles.findIndex((file: LgFile) => file.id === lgFile);
      const luExist = luFiles.findIndex((file: LuFile) => file.id === luFile);

      if (lgFile && lgExist === -1) {
        throw new Error(`${dialog.id}.dialog referred generator ${lgFile} not exist`);
      }
      if (luFile && luExist === -1) {
        throw new Error(`${dialog.id}.dialog referred recognizer ${luFile} not exist`);
      }
    }
  };

  private isLuFileEmpty = (file: LuFile) => {
    const { content, intents } = file;
    if (content && intents?.length) {
      return false;
    }
    return true;
  };

  private isReferred = (LUFile: LuFile) => {
    const dialogs = this.dialogs;
    if (dialogs.findIndex(dialog => dialog.luFile === LUFile.id) !== -1) {
      return true;
    }
    return false;
  };

  private generateErrorMessage = (invalidLuFile: LuFile[]) => {
    return invalidLuFile.reduce((msg, file) => {
      const fileErrorText = file.diagnostics.reduce((text, diagnostic) => {
        text += `\n ${createSingleMessage(diagnostic)}`;
        return text;
      }, `In ${file.id}.lu: `);
      msg += `\n ${fileErrorText} \n`;
      return msg;
    }, '');
  };
}
