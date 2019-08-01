import crypto from 'crypto';

import { IConfig } from 'lubuild/typings/lib/IConfig';
import { keys, replace } from 'lodash';
import { runBuild } from 'lubuild';
import { LuisAuthoring } from 'luis-apis';
import * as msRest from '@azure/ms-rest-js';
import { AzureClouds, AzureRegions } from 'luis-apis/typings/lib/models';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisSettings, FileState, LUFile, ILuisConfig, ILuisState } from './interface';

const ENDPOINT_KEYS = ['endpoint', 'endpointKey'];
const GENERATEDFOLDER = 'generated';

export class LuPublisher {
  public luPath: string;
  public generatedFolderPath: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public status: { [key: string]: string }[] = [];

  constructor(path: string, storage: IFileStorage) {
    this.luPath = path;
    this.generatedFolderPath = Path.join(path, GENERATEDFOLDER);
    this.storage = storage;
  }

  public update = async (path: string) => {
    try {
      const luisState: ILuisState = await this._getLuState();
      if (luisState === null) return true;

      const name = await this._getAppName(path);
      const status = luisState[name];
      if (status && status.status === FileState.UPDATED) {
        return true;
      }

      const newChecksum = await this._checksum(this.luPath + '/' + path);
      if (newChecksum !== status.checksum) {
        status.checksum = newChecksum;
        status.status = FileState.UPDATED;
      }
      luisState[name] = status;
      await this._setLuState(luisState);
      return true;
    } catch (error) {
      return error;
    }
  };

  public publish = async (luisConfig: ILuisConfig, luFiles: LUFile[]) => {
    this.config = luisConfig;
    const config = this._getConfig(luisConfig, luFiles);
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }

    //const settings: ILuisSettings = await this._getSettings();
    await runBuild(config);
    await this._copyDialogsToTargetFolder(config);
    return await this._updateStatus(config.authoringKey, config);
  };

  public checkLuisDeployed = async () => {
    const setting: ILuisSettings = await this._getSettings();
    if (setting === null) return false;
    const appNames = keys(setting.luis);
    return appNames.every(async name => {
      if (ENDPOINT_KEYS.indexOf(name) < 0) {
        return await this.storage.exists(`${name.split('_').join('.')}.dialog`);
      }
      return true;
    });
  };

  public getLuisStatus = async () => {
    const luisState = await this._getLuState();
    if (luisState === null) return [];
    const status = luisState;
    this.status = keys(status).reduce((result: { [key: string]: string }[], item) => {
      let name = item.split('_').join('.');
      name = replace(name, '.en-us', '');
      result.push({ name, ...status[item] });
      return result;
    }, []);
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = (config: ILuisConfig) => {
    this.config = config;
  };

  private _copyDialogsToTargetFolder = async (config: any) => {
    if (this.config === null) return '';
    const defaultLanguage = this.config.defaultLanguage;
    await config.models.forEach(async (filePath: string) => {
      const baseName = Path.basename(filePath, '.lu');
      const rootPath = Path.dirname(filePath);
      const currentPath = `${filePath}.dialog`;
      const targetPath = `${this.generatedFolderPath}/${baseName}.lu.dialog`;
      const currentVariantPath = `${rootPath}/${baseName}.${defaultLanguage}.lu.dialog`;
      const targetVariantPath = `${this.generatedFolderPath}/${baseName}.${defaultLanguage}.lu.dialog`;
      await this.storage.copyFile(currentPath, targetPath);
      await this.storage.copyFile(currentVariantPath, targetVariantPath);
      await this.storage.removeFile(currentPath);
      await this.storage.removeFile(currentVariantPath);
    });
  };

  private _updateStatus = async (authoringKey: string, config: IConfig) => {
    const credentials = new msRest.ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': authoringKey },
    });
    const client = new LuisAuthoring(credentials as any, {});
    const setting: ILuisSettings = await this._getSettings();
    const luisState: ILuisState = {};
    const names = keys(setting.luis);
    for (const name of names) {
      if (ENDPOINT_KEYS.indexOf(name) < 0) {
        const appInfo = await client.apps.get(
          config.authoringRegion as AzureRegions,
          'com' as AzureClouds,
          setting.luis[name]
        );
        luisState[name] = { version: appInfo.activeVersion, checksum: '', status: FileState.LATEST };
      }
    }
    await this._setLuState(luisState);
    return luisState;
  };

  private _getSettingPath = async () => {
    if (this.config !== null) {
      return Path.join(
        this.generatedFolderPath,
        `luis.settings.${this.config.environment}.${this.config.authoringRegion}.json`
      );
    } else {
      const filePaths = await this.storage.glob('**/luis.settings.*.json', this.luPath);
      if (filePaths.length > 0) {
        //TODO: maybe more than one
        return Path.join(this.luPath, filePaths[0]);
      }
    }

    return '';
  };

  private _getLuStatePath = async () => {
    return Path.join(this.generatedFolderPath, `luis.status.json`);
  };

  private _getAppName = async (path: string) => {
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

  private _checksum = async (path: string) => {
    const text = await this.storage.readFile(path);
    return crypto
      .createHash('md5')
      .update(text)
      .digest('hex');
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

  private _getConfig = (config: ILuisConfig, luFiles: LUFile[]) => {
    const luConfig: any = config;
    luConfig.models = [];
    luConfig.autodelete = true;
    luConfig.dialogs = true;
    luConfig.force = false;
    luConfig.folder = this.generatedFolderPath;
    luFiles.forEach(file => {
      luConfig.models.push(Path.resolve(this.luPath, file.relativePath));
    });

    return luConfig;
  };

  private _getSettings = async () => {
    const settingPath = await this._getSettingPath();
    if (settingPath === '') return null;
    return await this._getJsonObject(settingPath);
  };

  // private _setSettings = async (settings: ILuisSettings) => {
  //   const settingPath = await this._getSettingPath();
  //   return await this.storage.writeFile(settingPath, JSON.stringify(settings, null, 4));
  // };

  private _getLuState = async () => {
    const luStatePath = await this._getLuStatePath();
    if (!this.storage.exists(luStatePath)) {
      return null;
    } else {
      return await this._getJsonObject(luStatePath);
    }
  };

  private _setLuState = async (luState: ILuisState) => {
    const luStatePath = await this._getLuStatePath();
    return await this.storage.writeFile(luStatePath, JSON.stringify(luState, null, 4));
  };
}
