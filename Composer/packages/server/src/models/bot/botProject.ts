import fs from 'fs';

import { isEqual } from 'lodash';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { IEnvironment, EnvironmentProvider } from '../environment';
import { ISettingManager, OBFUSCATED_VALUE } from '../settings';

import { IFileStorage } from './../storage/interface';
import { LocationRef, FileInfo, LGFile, Dialog, LUFile, LuisStatus, FileUpdateType } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';
import { LGIndexer } from './indexers/lgIndexer';
import { LUIndexer } from './indexers/luIndexer';
import { LuPublisher } from './luPublisher';
import { DialogSetting } from './interface';

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

export class BotProject {
  public ref: LocationRef;

  public name: string;
  public dir: string;
  public files: FileInfo[] = [];
  public fileStorage: IFileStorage;
  public dialogIndexer: DialogIndexer;
  public lgIndexer: LGIndexer;
  public luIndexer: LUIndexer;
  public luPublisher: LuPublisher;
  public defaultSDKSchema: { [key: string]: string };
  public defaultEditorSchema: { [key: string]: string };
  public environment: IEnvironment;
  public settingManager: ISettingManager;
  public settings: DialogSetting | null = null;
  constructor(ref: LocationRef) {
    this.ref = ref;
    this.dir = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));
    this.defaultEditorSchema = JSON.parse(
      fs.readFileSync(Path.join(__dirname, '../../../schemas/editor.schema'), 'utf-8')
    );

    this.environment = EnvironmentProvider.getCurrentWithOverride({ basePath: this.dir });
    this.settingManager = this.environment.getSettingsManager();
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);

    this.dialogIndexer = new DialogIndexer(this.name);
    this.lgIndexer = new LGIndexer();
    this.luIndexer = new LUIndexer();
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
  }

  public index = async () => {
    this.files = await this._getFiles();
    this.settings = await this.getEnvSettings(this.environment.getDefaultSlot(), false);
    this.dialogIndexer.index(this.files);
    this.lgIndexer.index(this.files);
    await this.luIndexer.index(this.files); // ludown parser is async
    await this._checkProjectStructure();
    if (this.settings) {
      await this.luPublisher.setLuisConfig(this.settings.luis);
    }
    await this.luPublisher.loadStatus(this.luIndexer.getLuFiles().map(f => f.relativePath));
  };

  public getIndexes = () => {
    return {
      botName: this.name,
      dialogs: this.dialogIndexer.getDialogs(),
      lgFiles: this.lgIndexer.getLgFiles(),
      luFiles: this.mergeLuStatus(this.luIndexer.getLuFiles(), this.luPublisher.status),
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
    if (settings && oauthInput().MicrosoftAppId !== OBFUSCATED_VALUE) {
      settings.MicrosoftAppId = oauthInput().MicrosoftAppId;
    }
    if (settings && oauthInput().MicrosoftAppPassword !== OBFUSCATED_VALUE) {
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

  // merge the status managed by luPublisher to the LuFile structure to keep a unified interface
  private mergeLuStatus = (luFiles: LUFile[], luStatus: { [key: string]: LuisStatus }) => {
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
      editor: { content: editorSchema },
      sdk: { content: sdkSchema },
      diagnostics,
    };
  };

  public updateBotInfo = async (name: string, description: string) => {
    const dialogs = this.dialogIndexer.getDialogs();
    const mainDialog = dialogs.find(item => item.isRoot);
    if (mainDialog !== undefined) {
      mainDialog.content.$designer = {
        ...mainDialog.content.$designer,
        name,
        description,
      };
      await this.updateDialog('Main', mainDialog.content);
    }
  };

  public updateDialog = async (id: string, dialogContent: any): Promise<Dialog[]> => {
    const dialog = this.dialogIndexer.getDialogs().find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }

    const relativePath = dialog.relativePath;
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    await this._updateFile(relativePath, content);

    return this.dialogIndexer.getDialogs();
  };

  public createDialog = async (id: string, content: string = '', dir: string = ''): Promise<Dialog[]> => {
    const dialog = this.dialogIndexer.getDialogs().find(d => d.id === id);
    if (dialog) {
      throw new Error(`${id} dialog already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.dialog`);
    await this._createFile(relativePath, content);
    return this.dialogIndexer.getDialogs();
  };

  public removeDialog = async (id: string): Promise<Dialog[]> => {
    if (id === 'Main') {
      throw new Error(`Main dialog can't be removed`);
    }

    const dialog = this.dialogIndexer.getDialogs().find(d => d.id === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${id}`);
    }

    await this._removeFile(dialog.relativePath);
    return this.dialogIndexer.getDialogs();
  };

  public updateLgFile = async (id: string, content: string): Promise<LGFile[]> => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    const absolutePath = `${this.dir}/${lgFile.relativePath}`;
    const diagnostics = this.lgIndexer.check(content, absolutePath);
    if (this.lgIndexer.isValid(diagnostics) === false) {
      const errorMsg = this.lgIndexer.combineMessage(diagnostics);
      throw new Error(errorMsg);
    }
    await this._updateFile(lgFile.relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public createLgFile = async (id: string, content: string, dir: string = ''): Promise<LGFile[]> => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile) {
      throw new Error(`${id} lg file already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    const absolutePath = `${this.dir}/${relativePath}`;
    const diagnostics = this.lgIndexer.check(content, absolutePath);
    if (this.lgIndexer.isValid(diagnostics) === false) {
      const errorMsg = this.lgIndexer.combineMessage(diagnostics);
      throw new Error(errorMsg);
    }
    await this._createFile(relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public removeLgFile = async (id: string): Promise<LGFile[]> => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._removeFile(lgFile.relativePath);
    return this.lgIndexer.getLgFiles();
  };

  public updateLuFile = async (id: string, content: string): Promise<LUFile[]> => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    let currentLufileParsedContentLUISJsonStructure = null;
    try {
      currentLufileParsedContentLUISJsonStructure = await this.luIndexer.parse(content);
    } catch (error) {
      throw new Error(`Update ${id}.lu Failed, ${error.text}`);
    }

    const preLufileParsedContentLUISJsonStructure = luFile.parsedContent.LUISJsonStructure;
    const isUpdate = !isEqual(currentLufileParsedContentLUISJsonStructure, preLufileParsedContentLUISJsonStructure);
    if (!isUpdate) return this.luIndexer.getLuFiles();

    await this._updateFile(luFile.relativePath, content);
    await this.luPublisher.onFileChange(luFile.relativePath, FileUpdateType.UPDATE);

    return this.mergeLuStatus(this.luIndexer.getLuFiles(), this.luPublisher.status);
  };

  public createLuFile = async (id: string, content: string, dir: string = ''): Promise<LUFile[]> => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile) {
      throw new Error(`${id} lu file already exist`);
    }
    const relativePath = Path.join(dir, `${id.trim()}.lu`);

    // TODO: validate before save
    await this._createFile(relativePath, content);
    await this.luPublisher.onFileChange(relativePath, FileUpdateType.CREATE); // let publisher know that some files changed
    return this.mergeLuStatus(this.luIndexer.getLuFiles(), this.luPublisher.status); // return a merged LUFile always
  };

  public removeLuFile = async (id: string): Promise<LUFile[]> => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    await this._removeFile(luFile.relativePath);
    await this.luPublisher.onFileChange(luFile.relativePath, FileUpdateType.DELETE);
    return this.mergeLuStatus(this.luIndexer.getLuFiles(), this.luPublisher.status);
  };

  public publishLuis = async (authoringKey: string) => {
    await this.luPublisher.setAuthoringKey(authoringKey);
    const referred = this.luIndexer.getLuFiles().filter(this.isReferred);
    const unpublished = await this.luPublisher.getUnpublisedFiles(referred);

    const invalidLuFile = unpublished.filter(file => file.diagnostics.length !== 0);
    if (invalidLuFile.length !== 0) {
      const msg = this.generateErrorMessage(invalidLuFile);
      throw new Error(`The Following LuFile(s) are invalid: \n` + msg);
    }
    const emptyLuFiles = unpublished.filter(this.isEmpty);
    if (emptyLuFiles.length !== 0) {
      const msg = emptyLuFiles.map(file => file.id).join(' ');
      throw new Error(`You have the following empty LuFile(s): ` + msg);
    }

    try {
      if (unpublished.length > 0) {
        await this.luPublisher.publish(unpublished);
      }
    } catch (error) {
      throw error;
    }
    return this.mergeLuStatus(this.luIndexer.getLuFiles(), this.luPublisher.status);
  };

  public checkLuisPublished = async () => {
    const referredLuFiles = this.luIndexer.getLuFiles().filter(this.isReferred);
    if (referredLuFiles.length <= 0) {
      return true;
    } else {
      return await this.luPublisher.checkLuisPublised(referredLuFiles);
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

  // create file in this project this function will gurantee the memory cache
  // (this.files, all indexes) also gets updated
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
    await this.ensureDirExists(Path.dirname(absolutePath));
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

  // re index according to file change in a certain path
  private reindex = async (filePath: string) => {
    const fileExtension = Path.extname(filePath);
    // only call the specific indexer to re-index
    switch (fileExtension) {
      case '.dialog':
        this.dialogIndexer.index(this.files);
        break;
      case '.lg':
        this.lgIndexer.index(this.files);
        break;
      case '.lu':
        await this.luIndexer.index(this.files); // ludown parser is async
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
      const paths = await this.fileStorage.glob(pattern, this.dir);

      for (const filePath of paths.sort()) {
        const realFilePath: string = Path.join(this.dir, filePath);
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
    const dialogs: Dialog[] = this.dialogIndexer.getDialogs();
    const luFiles: LUFile[] = this.luIndexer.getLuFiles();
    const lgFiles: LGFile[] = this.lgIndexer.getLgFiles();

    // ensure each dialog folder have a lu file, e.g.
    /**
     * + AddToDo (folder)
     *   - AddToDo.dialog
     *   - AddToDo.lu                     // if not exist, auto create it
     */
    for (const dialog of dialogs) {
      // dialog/lu should in the same path folder
      const targetLuFilePath = dialog.relativePath.replace(new RegExp(/\.dialog$/), '.lu');
      const exist = luFiles.findIndex((luFile: LUFile) => luFile.relativePath === targetLuFilePath);
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
      const lgExist = lgFiles.findIndex((file: LGFile) => file.id === lgFile);
      const luExist = luFiles.findIndex((file: LUFile) => file.id === luFile);

      if (lgFile && lgExist === -1) {
        throw new Error(`${dialog.id}.dialog referred generator ${lgFile} not exist`);
      }
      if (luFile && luExist === -1) {
        throw new Error(`${dialog.id}.dialog referred recognizer ${luFile} not exist`);
      }
    }
  };

  private isEmpty = (LUFile: LUFile) => {
    if (LUFile === undefined) return true;
    if (LUFile.content === undefined || LUFile.content === '') return true;
    if (LUFile.parsedContent === undefined) return true;
    if (LUFile.parsedContent.LUISJsonStructure === undefined) return true;
    for (const key in LUFile.parsedContent.LUISJsonStructure) {
      if (LUFile.parsedContent.LUISJsonStructure[key].length !== 0) {
        return false;
      }
    }
    return true;
  };

  private isReferred = (LUFile: LUFile) => {
    const dialogs = this.dialogIndexer.getDialogs();
    if (dialogs.findIndex(dialog => dialog.luFile === LUFile.id) !== -1) {
      return true;
    }
    return false;
  };

  private generateErrorMessage = (invalidLuFile: LUFile[]) => {
    return invalidLuFile.reduce((msg, file) => {
      const fileErrorText = file.diagnostics.reduce((text, diagnostic) => {
        text += `\n ${diagnostic.text}`;
        return text;
      }, `In ${file.id}.lu: `);
      msg += `\n ${fileErrorText} \n`;
      return msg;
    }, '');
  };
}
