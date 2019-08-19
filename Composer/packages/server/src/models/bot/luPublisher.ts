import { keys, replace, isEqual } from 'lodash';
import { runBuild } from 'lubuild';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { LUFile, ILuisConfig, ILuisStatus } from './interface';

const GENERATEDFOLDER = 'generated';

export class LuPublisher {
  public botDir: string;
  public generatedFolderPath: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public status: { [key: string]: string }[] = [];

  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.storage = storage;
  }

  public update = async (isUpdated: boolean, path: string) => {
    if (!isUpdated) return;

    const luisStatus: ILuisStatus = await this._getLuStatus();
    if (luisStatus === null) return;

    const appName = await this._getAppName(path);
    const name = this._getName(appName);
    if (!appName || !name || !luisStatus[name]) return;

    const status = luisStatus[name];

    status.lastUpdateTime = new Date().getTime();
    luisStatus[name] = status;
    await this._setLuStatus(luisStatus);
  };

  public publish = async (luFiles: LUFile[]) => {
    const config = this._getConfig(luFiles);
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }
    try {
      await runBuild(config);
    } catch (error) {
      console.error(error);
      throw new Error('Error publishing to LUIS.');
    }

    await this._copyDialogsToTargetFolder(config);
  };

  public getUnpublisedFiles = async (files: LUFile[]) => {
    const luStatus: ILuisStatus = await this._getLuStatus();
    if (luStatus === null) return files;
    const result: LUFile[] = [];
    for (const file of files) {
      const appName = this._getAppName(file.id);
      const name = this._getName(appName);
      // //if no generated files, no status, check file's checksum
      if (
        !(await this.storage.exists(`${this.generatedFolderPath}/${appName.split('_').join('.')}.dialog`)) ||
        !luStatus[name] ||
        !luStatus[name].lastPublishTime ||
        !luStatus[name].lastUpdateTime ||
        luStatus[name].lastUpdateTime >= luStatus[name].lastPublishTime
      ) {
        result.push(file);
      }
    }
    return result;
  };

  public checkLuisPublised = async (files: LUFile[]) => {
    const unpublished = await this.getUnpublisedFiles(files);
    return unpublished.length === 0;
  };

  public getLuisStatus = async () => {
    const luisStatus = await this._getLuStatus();
    if (luisStatus === null) return [];
    const status = luisStatus;
    this.status = keys(status).reduce((result: { [key: string]: string }[], item) => {
      let name = item.split('_').join('.');
      name = replace(name, '.en-us', '');
      result.push({ name, ...status[item] });
      return result;
    }, []);
    return this.status;
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = async (config: ILuisConfig) => {
    if (!isEqual(config, this.config)) {
      this.config = config;
      if (!(await this.storage.exists(this._getSettingPath(config)))) {
        await this._deleteGenerated(this.generatedFolderPath);
      }
    }
  };

  //delete files in generated folder
  private async _deleteGenerated(path: string) {
    if (await this.storage.exists(path)) {
      const files = await this.storage.readDir(path);
      for (const file of files) {
        const curPath = Path.join(path, file);
        if ((await this.storage.stat(curPath)).isDir) {
          await this._deleteGenerated(curPath);
        } else {
          await this.storage.removeFile(curPath);
        }
      }
    }
  }

  private _copyDialogsToTargetFolder = async (config: any) => {
    const defaultLanguage = config.defaultLanguage;
    await config.models.forEach(async (filePath: string) => {
      const baseName = Path.basename(filePath, '.lu');
      const rootPath = Path.dirname(filePath);
      const currentPath = `${filePath}.dialog`;
      const targetPath = Path.join(this.generatedFolderPath, `${baseName}.lu.dialog`);
      const currentVariantPath = Path.join(rootPath, `${baseName}.${defaultLanguage}.lu.dialog`);
      const targetVariantPath = Path.join(this.generatedFolderPath, `${baseName}.${defaultLanguage}.lu.dialog`);
      await this.storage.copyFile(currentPath, targetPath);
      await this.storage.copyFile(currentVariantPath, targetVariantPath);
      await this.storage.removeFile(currentPath);
      await this.storage.removeFile(currentVariantPath);
    });
  };

  private _getSettingPath = (config: ILuisConfig | null) => {
    if (config === null) return '';
    return Path.join(this.generatedFolderPath, `luis.settings.${config.environment}.${config.authoringRegion}.json`);
  };

  private _getLuStatusPath = async () => {
    return Path.join(this.generatedFolderPath, `luis.status.json`);
  };

  private _getAppName = (path: string) => {
    if (this.config === null) return '';
    const culture = this._getCultureFromPath(path) || this.config.defaultLanguage;
    let name = `${Path.basename(path, '.lu')}.${culture}.lu`;
    name = name.split('.').join('_');
    return name;
  };

  private _getJsonObject = async (path: string) => {
    if (await this.storage.exists(path)) {
      const json = await this.storage.readFile(path);
      return JSON.parse(json);
    } else {
      return null;
    }
  };

  private _getCultureFromPath = (file: string): string | null => {
    const fn = Path.basename(file, Path.extname(file));
    const lang = Path.extname(fn).substring(1);
    switch (lang.toLowerCase()) {
      case 'en-us':
      case 'zh-cn':
      case 'nl-nl':
      case 'fr-fr':
      case 'fr-ca':
      case 'de-de':
      case 'it-it':
      case 'ja-jp':
      case 'ko-kr':
      case 'pt-br':
      case 'es-es':
      case 'es-mx':
      case 'tr-tr':
        return lang;
      default:
        return null;
    }
  };

  private _getConfig = (luFiles: LUFile[]) => {
    const luConfig: any = this.config;
    luConfig.models = [];
    luConfig.autodelete = true;
    luConfig.dialogs = true;
    luConfig.force = false;
    luConfig.folder = this.generatedFolderPath;
    luFiles.forEach(file => {
      luConfig.models.push(Path.resolve(this.botDir, file.relativePath));
    });

    return luConfig;
  };

  private _getLuStatus = async () => {
    const luStatePath = await this._getLuStatusPath();
    if (!this.storage.exists(luStatePath)) {
      return null;
    } else {
      return await this._getJsonObject(luStatePath);
    }
  };

  private _setLuStatus = async (luState: ILuisStatus) => {
    const luStatusPath = await this._getLuStatusPath();
    return await this.storage.writeFile(luStatusPath, JSON.stringify(luState, null, 4));
  };

  private _getName = (appName: string) => {
    const tokens = appName.split('_');
    return tokens[0];
  };
}
