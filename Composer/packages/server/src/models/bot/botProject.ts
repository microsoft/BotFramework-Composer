// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import has from 'lodash/has';
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
  JsonWalk,
  VisitorFunc,
} from '@bfc/indexers';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import { UserIdentity } from '../../services/pluginLoader';
import StorageService from '../../services/storage';
import { ISettingManager, OBFUSCATED_VALUE } from '../settings';
import { DefaultSettingManager } from '../settings/defaultSettingManager';
import log from '../../logger';

import { IFileStorage } from './../storage/interface';
import { LocationRef } from './interface';
import { LuPublisher } from './luPublisher';
import { DialogSetting } from './interface';

const debug = log.extend('bot-project');
const DIALOGFOLDER = '';

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

interface DialogResources {
  dialogs: DialogInfo[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
}

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
  public settingManager: ISettingManager;
  public settings: DialogSetting | null = null;
  constructor(ref: LocationRef, user?: UserIdentity) {
    this.ref = ref;
    this.locale = 'en-us'; // default to en-us
    this.dir = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dataDir = Path.join(this.dir, DIALOGFOLDER);
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));
    this.defaultEditorSchema = JSON.parse(
      fs.readFileSync(Path.join(__dirname, '../../../schemas/editor.schema'), 'utf-8')
    );

    this.settingManager = new DefaultSettingManager(this.dir);
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId, user);
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
  }

  public index = async () => {
    await this._reformProjectStructure();

    this.files = await this._getFiles();
    this.settings = await this.getEnvSettings('', false);
    this.dialogs = this.indexDialogs();
    this.lgFiles = lgIndexer.index(this.files, this._lgImportResolver);
    this.luFiles = luIndexer.index(this.files);
    await this._checkProjectStructure();
    if (this.settings) {
      await this.luPublisher.setLuisConfig(this.settings.luis);
    }
  };

  public getIndexes = () => {
    this.lgFiles = lgIndexer.index(this.files, this._lgImportResolver);
    return {
      botName: this.name,
      location: this.dir,
      dialogs: this.dialogs,
      lgFiles: this.lgFiles,
      luFiles: this.luFiles,
      schemas: this.getSchemas(),
      settings: this.settings,
    };
  };

  public getDefaultSlotEnvSettings = async (obfuscate: boolean) => {
    const defaultSlot = '';
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
    const defaultSlot = '';
    await this.updateEnvSettings(defaultSlot, config);
  };

  // create or update dialog settings
  public updateEnvSettings = async (slot: string, config: DialogSetting) => {
    await this.settingManager.set(slot, config);
    await this.luPublisher.setLuisConfig(config.luis);
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
      await this.updateDialog(mainDialog.id, mainDialog.content);
    }
  };

  public updateDialog = async (id: string, dialogContent: any): Promise<string> => {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }

    const relativePath = dialog.relativePath;
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    const lastModified = await this._updateFile(relativePath, content);
    return lastModified;
  };

  public createDialog = async (
    id: string,
    content = '',
    dir: string = this.defaultDir(id, '.dialog')
  ): Promise<DialogResources> => {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      throw new Error(`${id} dialog already exist`);
    }

    const DIALOGNAME = id;
    const LOCALE = this.locale;
    const dialogFilePath = Path.join(dir, `${id.trim()}.dialog`);
    const lgFilePathDir = Path.join(
      dir,
      Path.dirname(templateInterpolate(BotStructureTemplate.dialogs.lg, { DIALOGNAME, LOCALE }))
    );
    const luFilePathDir = Path.join(
      dir,
      Path.dirname(templateInterpolate(BotStructureTemplate.dialogs.lu, { DIALOGNAME, LOCALE }))
    );

    const updateContent = this._autofixReferInDialog(id, content);
    await this._createFile(dialogFilePath, updateContent);
    await this.createLuFile(`${id}.${LOCALE}`, '', luFilePathDir);
    await this.createLgFile(`${id}.${LOCALE}`, '', lgFilePathDir);

    const { dialogs, lgFiles, luFiles } = this;
    return { dialogs, lgFiles, luFiles };
  };

  public removeDialog = async (id: string): Promise<DialogResources> => {
    if (id === 'Main') {
      throw new Error(`Main dialog can't be removed`);
    }

    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }
    const DIALOGNAME = id;
    const LOCALE = this.locale;
    const dialogFolder = Path.dirname(dialog.relativePath);
    const dialogFilePath = dialog.relativePath;
    const lgFilePath = Path.join(
      dialogFolder,
      templateInterpolate(BotStructureTemplate.dialogs.lg, { DIALOGNAME, LOCALE })
    );
    const luFilePath = Path.join(
      dialogFolder,
      templateInterpolate(BotStructureTemplate.dialogs.lu, { DIALOGNAME, LOCALE })
    );
    await this._removeFile(dialogFilePath);
    await this._removeFile(lgFilePath);
    await this._removeFile(luFilePath);
    this._cleanUp(dialogFolder);
    const { dialogs, lgFiles, luFiles } = this;
    return { dialogs, lgFiles, luFiles };
  };

  public updateLgFile = async (id: string, content: string): Promise<string> => {
    const lgFile = this.files.find(lg => lg.name === `${id}.lg`);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    return await this._updateFile(lgFile.relativePath, content);
  };

  public createLgFile = async (
    id: string,
    content: string,
    dir: string = this.defaultDir(id, '.lg')
  ): Promise<LgFile[]> => {
    const lgFile = this.files.find(lg => lg.name === `${id}.lg`);
    if (lgFile) {
      throw new Error(`${id} lg file already exist`);
    }
    // slot with common.lg import
    let lgInitialContent = '';
    const commonLgFileName = `common.${this.locale}.lg`;
    const lgCommonFile = this.files.find(({ name }) => name === commonLgFileName);
    if (lgCommonFile) {
      lgInitialContent = `[import](common.lg)`;
    }
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    await this._createFile(relativePath, [lgInitialContent, content].join('\n'));
    return this.lgFiles;
  };

  public removeLgFile = async (id: string): Promise<LgFile[]> => {
    const lgFile = this.files.find(lg => lg.name === `${id}.lg`);
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

    return this.luFiles;
  };

  public createLuFile = async (
    id: string,
    content: string,
    dir: string = this.defaultDir(id, '.lu')
  ): Promise<LuFile[]> => {
    const luFile = this.luFiles.find(lu => lu.id === id);
    if (luFile) {
      throw new Error(`${id} lu file already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.lu`);

    // TODO: validate before save
    await this._createFile(relativePath, content);
    return this.luFiles; // return a merged LUFile always
  };

  public removeLuFile = async (id: string): Promise<LuFile[]> => {
    const luFile = this.luFiles.find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }

    await this._removeFile(luFile.relativePath);

    await this._cleanUp(luFile.relativePath);
    return this.luFiles;
  };

  public publishLuis = async (authoringKey: string) => {
    this.luPublisher.setAuthoringKey(authoringKey);
    const referred = this.luFiles.filter(this.isReferred);

    const invalidLuFile = referred.filter(file => file.diagnostics.length !== 0);
    if (invalidLuFile.length !== 0) {
      const msg = this.generateErrorMessage(invalidLuFile);
      throw new Error(`The Following LuFile(s) are invalid: \n` + msg);
    }
    const emptyLuFiles = referred.filter(this.isLuFileEmpty);
    if (emptyLuFiles.length !== 0) {
      const msg = emptyLuFiles.map(file => file.id).join(' ');
      throw new Error(`You have the following empty LuFile(s): ` + msg);
    }

    if (referred.length > 0) {
      this.luPublisher.createCrossTrainConfig(this.dialogs, referred);
      await this.luPublisher.publish(referred);
    }

    return this.luFiles;
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

  private defaultDir = (id: string, fileType: string) => {
    const DIALOGNAME = id;
    const LOCALE = this.locale;
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

    // update this.files which is memory cache of all files
    this.files.push({
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
      lastModified: stats.lastModified,
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

    // only write if the file has actually changed
    if (this.files[index].content !== content) {
      await this.fileStorage.writeFile(absolutePath, content);
    }

    // TODO: we should get the lastModified from the writeFile operation
    // instead of calling stat again which could be expensive
    const stats = await this.fileStorage.stat(absolutePath);

    this.files[index].content = content;
    await this.reindex(relativePath);

    return stats.lastModified;
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

  private indexDialogs() {
    return dialogIndexer.index(this.files, this.name, this.getSchemas().sdk.content);
  }

  /**
   *  @param source current file id
   *  @param id imported file path
   *  for example:
   *  in todosample.en-us.lg:
   *   [import](../common/common.lg)
   *
   *  resolve to common.en-us.lg || common.lg
   *
   *  source =  todosample || todosample.en-us || todosample.en-us.lg || todosample.lg
   *  id =   common || common.lg || ../common/common.lg
   *
   */
  private _lgImportResolver = (source: string, id: string) => {
    const sourceId = Path.basename(source, '.lg');
    const locale = sourceId.split('.').length > 1 ? sourceId.split('.').pop() : this.locale;
    const targetId = Path.basename(id, '.lg');

    const targetFile =
      this.files.find(({ name }) => name === `${targetId}.${locale}.lg`) ||
      this.files.find(({ name }) => name === `${targetId}.lg`);
    if (!targetFile) throw new Error('file not found');
    return {
      id,
      content: targetFile.content,
    };
  };

  // re index according to file change in a certain path
  private reindex = async (filePath: string) => {
    const fileExtension = Path.extname(filePath);
    // only call the specific indexer to re-index
    switch (fileExtension) {
      case '.dialog':
        this.dialogs = this.indexDialogs();
        break;
      case '.lg':
        this.lgFiles = lgIndexer.index(this.files, this._lgImportResolver);
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
    const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu'];
    for (const pattern of patterns) {
      // load only from the data dir, otherwise may get "build" versions from
      // deployment process
      const root = this.dataDir;
      const paths = await this.fileStorage.glob([pattern, '!(generated/**)'], root);

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

  /**
   * Reform bot project structure
   * /[dialog]
        [dialog].dialog
        /language-generation
            /[locale]
                 [dialog].[locale].lg
        /language-understanding
            /[locale]
                 [dialog].[locale].lu
  * 
  */
  private _reformProjectStructure = async () => {
    let isOldBotStructure = false;

    const BOTNAME = this.name.toLowerCase();
    const LOCALE = this.locale;

    const TemplateVariables = {
      BOTNAME,
      LOCALE,
      DIALOGNAME: '',
    };

    const files: { [key: string]: string }[] = [];

    // Reform all files according to above defined structure.
    const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu', '**/*.schema', '**/*.json'];
    for (const pattern of patterns) {
      const root = this.dataDir;
      const paths = await this.fileStorage.glob(pattern, root);
      for (const filePath of paths.sort()) {
        const realFilePath: string = Path.join(root, filePath);
        if ((await this.fileStorage.stat(realFilePath)).isFile) {
          let content: string = await this.fileStorage.readFile(realFilePath);
          const name = Path.basename(filePath);

          // mark as old bot structure, then will continue do move.
          if (name === 'Main.dialog') {
            isOldBotStructure = true;
          }

          // convert file name from camel to lowercase
          const fileId = name.split('.')[0].toLowerCase();
          let targetRelativePath;
          let pathEndPoint = '';
          const fileType = Path.extname(filePath);
          let dialogName = fileId === 'main' ? BOTNAME : fileId;

          // nested dialogs
          // e.g foo/bar/bar.dialog
          // - > foo/dialogs/bar.dialog
          // TODO: need optimize.
          const filePathDirs = filePath.replace('ComposerDialogs/', '').split('/');
          if (filePathDirs.length > 2) {
            dialogName = filePathDirs[filePathDirs.length - 2].toLowerCase();
            const parrentDialogName = filePathDirs[filePathDirs.length - 3].toLowerCase();
            pathEndPoint = Path.join(pathEndPoint, 'dialogs', parrentDialogName);
          }

          // wrap path dialogs/[dialogId]
          if (fileId !== 'main' && fileId !== 'common') {
            pathEndPoint = Path.join(pathEndPoint, BotStructureTemplate.dialogs.folder);
          }
          // rename Main.* to botname.*
          TemplateVariables.DIALOGNAME = dialogName;

          if (fileType === '.dialog') {
            content = this._autofixReferInDialog(dialogName, content);

            targetRelativePath = templateInterpolate(
              Path.join(pathEndPoint, BotStructureTemplate.dialogs.entry),
              TemplateVariables
            );
          } else if (fileType === '.lg') {
            if (name === 'common.lg') {
              targetRelativePath = templateInterpolate(BotStructureTemplate.common.lg, TemplateVariables);
            } else {
              targetRelativePath = templateInterpolate(
                Path.join(pathEndPoint, BotStructureTemplate.dialogs.lg),
                TemplateVariables
              );
            }
          } else if (fileType === '.lu') {
            targetRelativePath = templateInterpolate(
              Path.join(pathEndPoint, BotStructureTemplate.dialogs.lu),
              TemplateVariables
            );
          } else if (fileType === '.schema') {
            targetRelativePath = templateInterpolate(BotStructureTemplate.schema, { FILENAME: name });
          } else if (fileType === '.json') {
            targetRelativePath = templateInterpolate(BotStructureTemplate.settings, { FILENAME: name });
          }

          files.push({ targetRelativePath, realFilePath, content });
        }
      }
    }

    if (isOldBotStructure === false) {
      return;
    }

    // move files from /coolbot/ComposerDialogs/* to /coolbot/*
    const targetBotPath = this.dataDir;
    for (const file of files) {
      const { targetRelativePath, realFilePath, content } = file;
      const absolutePath = Path.join(targetBotPath, targetRelativePath);
      await this.fileStorage.removeFile(realFilePath);

      try {
        const dirPath = Path.dirname(realFilePath);
        await this.fileStorage.rmDir(dirPath);
      } catch (_error) {
        // pass , dir may not empty
      }

      await this.ensureDirExists(Path.dirname(absolutePath));
      await this.fileStorage.writeFile(absolutePath, content);
    }
  };

  private _getSchemas = async (): Promise<FileInfo[]> => {
    if (!(await this.exists())) {
      throw new Error(`${this.dir} is not a valid path`);
    }

    const schemasDir = Path.join(this.dir, 'Schemas');

    if (!(await this.fileStorage.exists(schemasDir))) {
      debug('No schemas directory found.');
      return [];
    }

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

  // check project stracture is valid or not, if not, try fix it.
  private _checkProjectStructure = async () => {
    const dialogs: DialogInfo[] = this.dialogs;
    const files: FileInfo[] = this.files;

    // ensure each dialog have a lg/lu file,
    /**
     * + addtodo (folder)
     *   - addtodo.dialog
     *   - language-understanding
     *      /en-us/addtodo.en-us.lu  // if not exist, auto create it
     *   - language-generation
     *      /en-us/addtodo.en-us.lg  // if not exist, auto create it
     */
    // const locale = this.locale;
    // for (const dialog of dialogs) {
    //   const dialogId = Path.basename(dialog.id);
    //   const dialogDir = Path.dirname(dialog.relativePath);
    //   const targetLuFilePath = Path.join(dialogDir, `language-understanding/${locale}/${dialogId}.${locale}.lu`);
    //   if (files.findIndex(({ relativePath }) => relativePath === targetLuFilePath) === -1) {
    //     await this._createFile(targetLuFilePath, '');
    //   }
    //   const targetLgFilePath = Path.join(dialogDir, `language-generation/${locale}/${dialogId}.${locale}.lg`);
    //   if (files.findIndex(({ relativePath }) => relativePath === targetLgFilePath) === -1) {
    //     await this._createFile(targetLgFilePath, '');
    //   }
    // }

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
      const lgExist = files.findIndex(({ name }) => name.startsWith(`${lgFile}.`));
      const luExist = files.findIndex(({ name }) => name.startsWith(`${luFile}.`));

      if (lgFile && lgExist === -1) {
        throw new Error(`${dialog.id}.dialog referred generator ${lgFile} not exist`);
      }
      if (luFile && luExist === -1) {
        throw new Error(`${dialog.id}.dialog referred recognizer ${luFile} not exist`);
      }
    }

    // This two function help migration now can be disabled or removed
    // await this._autofixTemplateInCommon();
    // await this._autofixGeneratorInDialog();
  };

  // private _buildRNNewlineText = (lineArray: string[]): string => {
  //   const lineArrayEndWithRN = lineArray.map(line => {
  //     if (line.endsWith('\r\n')) {
  //       return line;
  //     } else if (line.endsWith('\r')) {
  //       return line + '\n';
  //     } else {
  //       return line + '\r\n';
  //     }
  //   });
  //   return lineArrayEndWithRN.join('');
  // };

  /**
   * move generated lg template (like bfdactivity-123456) from common.lg into dialog.lg
   * help migrate old version single-lg bot to multiple-lg
   * we can disable this code after a period of time, when there is no old version bot.
   */

  // private _autofixTemplateInCommon = async () => {
  //   const NEWLINE = '\r\n';
  //   const dialogs: DialogInfo[] = this.dialogs;
  //   const lgFiles: LgFile[] = this.lgFiles;
  //   const inlineLgNamePattern = /bfd(\w+)-(\d+)/;
  //   const commonLgFileId = `common.${this.locale}`;
  //   const commonLgFile = lgFiles.find(({ id }) => id === commonLgFileId);
  //   if (!commonLgFile) return;
  //   const lineContentArray = commonLgFile.content.split('\n');
  //   for (const dialog of dialogs) {
  //     const { lgTemplates } = dialog;
  //     const dialogTemplateTexts: string[] = [];
  //     for (const lgTemplate of lgTemplates) {
  //       const templateName = lgTemplate.name;
  //       if (inlineLgNamePattern.test(templateName)) {
  //         const template = commonLgFile.templates.find(({ name }) => name === templateName);
  //         if (!template?.range) continue;
  //         const { startLineNumber, endLineNumber } = template.range;
  //         const lineCount = endLineNumber - startLineNumber + 1;
  //         const templateText = this._buildRNNewlineText(
  //           lineContentArray.splice(startLineNumber - 1, lineCount, ...Array(lineCount))
  //         );
  //         dialogTemplateTexts.push(templateText);
  //       }
  //     }
  //     const targetLgFileId = `${dialog.id}.${this.locale}`;
  //     const updatedContent =
  //       (lgFiles.find(({ id }) => id === targetLgFileId)?.content || '') +
  //       this._buildRNNewlineText(dialogTemplateTexts) +
  //       NEWLINE;
  //     await this.updateLgFile(targetLgFileId, updatedContent);
  //   }
  //   const updatedCommonContent = this._buildRNNewlineText(lineContentArray.filter(item => item !== undefined)).trim();
  //   await this.updateLgFile(commonLgFileId, updatedCommonContent);
  // };

  /**
   * each dialog should use it's own lg
   * e.g ShowToDo.dialog's generator property should be `ShowToDo.lg`.
   */
  // private _autofixGeneratorInDialog = async () => {
  //   const dialogs: DialogInfo[] = this.dialogs;
  //   for (const dialog of dialogs) {
  //     const { content, id } = dialog;
  //     const updatedContent = { ...content, generator: `${id}.lg` };
  //     await this.updateDialog(id, updatedContent);
  //   }
  // };

  /**
   * fix dialog referrence.
   * - "dialog": 'AddTodos'
   * + "dialog": 'addtodos'
   */
  private _autofixReferInDialog = (dialogId: string, content: string) => {
    try {
      const dialogJson = JSON.parse(content);

      // fix dialog referrence
      const visitor: VisitorFunc = (_path: string, value: any) => {
        if (has(value, '$type') && value.$type === 'Microsoft.BeginDialog') {
          const dialogName = value.dialog;
          value.dialog = dialogName.toLowerCase();
        }
        return false;
      };

      JsonWalk('/', dialogJson, visitor);

      // fix lg referrence
      dialogJson.generator = `${dialogId}.lg`;

      // fix lu referrence
      if (typeof dialogJson.recognizer === 'string') {
        dialogJson.recognizer = `${dialogId}.lu`;
      }

      return JSON.stringify(dialogJson, null, 2);
    } catch (_error) {
      // pass, content may be empty
      return content;
    }
  };

  private isLuFileEmpty = (file: LuFile) => {
    const { content, intents } = file;
    if (content && intents?.length) {
      return false;
    }
    return true;
  };

  private removeLocale(id: string): string {
    return id.substring(0, id.lastIndexOf('.')) || id;
  }

  private isReferred = (LUFile: LuFile) => {
    const dialogs = this.dialogs;
    return !!~dialogs.findIndex(dialog => dialog.luFile === this.removeLocale(LUFile.id));
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
