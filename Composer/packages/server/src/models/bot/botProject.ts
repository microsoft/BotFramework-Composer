// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import { getNewDesigner, FileInfo, DialogInfo, LgFile, LuFile } from '@bfc/shared';
import { dialogIndexer, lgIndexer, luIndexer, createSingleMessage } from '@bfc/indexers';

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

export class BotProject {
  public ref: LocationRef;
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
      await this.updateDialog('Main', mainDialog.content);
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
    dir: string = this.defaultDir(id)
  ): Promise<DialogResources> => {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      throw new Error(`${id} dialog already exist`);
    }
    const relativePathBase = Path.join(dir, id.trim());
    await this._createFile(`${relativePathBase}.dialog`, content);
    await this._createFile(`${relativePathBase}.lu`, '');
    await this.createLgFile(id, '', dir);

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
    const relativePathBase = dialog.relativePath.replace(/\.dialog$/, '');
    await this._removeFile(`${relativePathBase}.dialog`);
    await this._removeFile(`${relativePathBase}.lg`);
    await this._removeFile(`${relativePathBase}.lu`);
    this._cleanUp(dialog.relativePath);
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

  public createLgFile = async (id: string, content: string, dir: string = this.defaultDir(id)): Promise<LgFile[]> => {
    const lgFile = this.files.find(lg => lg.name === `${id}.lg`);
    if (lgFile) {
      throw new Error(`${id} lg file already exist`);
    }
    // slot with common.lg import
    let lgInitialContent = '';
    const lgCommonFile = this.files.find(({ name }) => name === 'common.lg');
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

  public createLuFile = async (id: string, content: string, dir: string = this.defaultDir(id)): Promise<LuFile[]> => {
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

  private defaultDir = (id: string) => Path.join(DIALOGFOLDER, id);

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
   *  in AddToDo.lg:
   *   [import](../common/common.lg)
   *
   * source = AddToDo.lg  || AddToDo
   * id = ../common/common.lg  || common.lg || common
   */
  private _lgImportResolver = (source: string, id: string) => {
    const targetId = Path.basename(id, '.lg');
    const targetFile = this.lgFiles.find(({ id }) => id === targetId);
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

    // ensure each dialog folder have a lu file, e.g.
    /**
     * + AddToDo (folder)
     *   - AddToDo.dialog
     *   - AddToDo.lu                     // if not exist, auto create it
     *   - AddToDo.lg                     // if not exist, auto create it
     */
    for (const dialog of dialogs) {
      const dialogDir = Path.dirname(dialog.relativePath);
      const dialogId = Path.basename(dialog.id);
      // dialog/lu should in the same path folder
      const targetLuFilePath = dialog.relativePath.replace(new RegExp(/\.dialog$/), '.lu');
      if (files.findIndex(({ relativePath }) => relativePath === targetLuFilePath) === -1) {
        await this._createFile(targetLuFilePath, '');
      }
      // dialog/lg should in the same path folder
      const targetLgFilePath = dialog.relativePath.replace(new RegExp(/\.dialog$/), '.lg');
      if (files.findIndex(({ relativePath }) => relativePath === targetLgFilePath) === -1) {
        await this.createLgFile(dialogId, '', dialogDir);
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
      const lgExist = files.findIndex(({ name }) => name === `${lgFile}.lg`);
      const luExist = files.findIndex(({ name }) => name === `${luFile}.lu`);

      if (lgFile && lgExist === -1) {
        throw new Error(`${dialog.id}.dialog referred generator ${lgFile} not exist`);
      }
      if (luFile && luExist === -1) {
        throw new Error(`${dialog.id}.dialog referred recognizer ${luFile} not exist`);
      }
    }

    await this._autofixTemplateInCommon();
    await this._autofixGeneratorInDialog();
  };

  private _buildRNNewlineText = (lineArray: string[]): string => {
    const lineArrayEndWithRN = lineArray.map(line => {
      if (line.endsWith('\r\n')) {
        return line;
      } else if (line.endsWith('\r')) {
        return line + '\n';
      } else {
        return line + '\r\n';
      }
    });
    return lineArrayEndWithRN.join('');
  };

  /**
   * move generated lg template (like bfdactivity-123456) from common.lg into dialog.lg
   * help migrate old version single-lg bot to multiple-lg
   * we can disable this code after a period of time, when there is no old version bot.
   */

  private _autofixTemplateInCommon = async () => {
    const NEWLINE = '\r\n';
    const dialogs: DialogInfo[] = this.dialogs;
    const lgFiles: LgFile[] = this.lgFiles;
    const inlineLgNamePattern = /bfd(\w+)-(\d+)/;
    const commonLgFile = lgFiles.find(({ id }) => id === 'common');
    if (!commonLgFile) return;
    const lineContentArray = commonLgFile.content.split('\n');
    for (const dialog of dialogs) {
      const { lgTemplates } = dialog;
      const dialogTemplateTexts: string[] = [];
      for (const lgTemplate of lgTemplates) {
        const templateName = lgTemplate.name;
        if (inlineLgNamePattern.test(templateName)) {
          const template = commonLgFile.templates.find(({ name }) => name === templateName);
          if (!template?.range) continue;
          const { startLineNumber, endLineNumber } = template.range;
          const lineCount = endLineNumber - startLineNumber + 1;
          const templateText = this._buildRNNewlineText(
            lineContentArray.splice(startLineNumber - 1, lineCount, ...Array(lineCount))
          );
          dialogTemplateTexts.push(templateText);
        }
      }
      if (dialogTemplateTexts.length) {
        const updatedContent =
          (lgFiles.find(({ id }) => id === dialog.id)?.content || '') +
          this._buildRNNewlineText(dialogTemplateTexts) +
          NEWLINE;
        await this.updateLgFile(dialog.id, updatedContent);
      }
    }
    const updatedCommonContent = this._buildRNNewlineText(lineContentArray.filter(item => item !== undefined)).trim();
    await this.updateLgFile('common', updatedCommonContent);
  };

  /**
   * each dialog should use it's own lg
   * e.g ShowToDo.dialog's generator property should be `ShowToDo.lg`.
   */
  private _autofixGeneratorInDialog = async () => {
    const dialogs: DialogInfo[] = this.dialogs;
    for (const dialog of dialogs) {
      const { content, id } = dialog;
      const updatedContent = { ...content, generator: `${id}.lg` };
      await this.updateDialog(id, updatedContent);
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
