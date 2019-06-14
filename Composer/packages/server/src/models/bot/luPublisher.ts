import crypto from 'crypto';

import { IConfig } from 'lubuild/typings/lib/IConfig';
import { keys } from 'lodash';
import { runBuild } from 'lubuild';
import { LuisAuthoring } from 'luis-apis';
import * as msRest from '@azure/ms-rest-js';
import { AzureClouds, AzureRegions } from 'luis-apis/typings/lib/models';

import settings from './../../settings/settings.json';
import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisSettings, FileState, LUFile } from './interface';

const CONFIGNAME = 'luconfig.json';
const ENDPOINT_KEYS = ['endpoint', 'endpointKey'];
const GENERATEDFOLDER = 'generated';

export class LuPublisher {
  public luPath: string;
  public generatedFolderPath: string;
  public storage: IFileStorage;

  constructor(path: string, storage: IFileStorage) {
    this.luPath = path;
    this.generatedFolderPath = Path.join(path, GENERATEDFOLDER);
    this.storage = storage;
  }

  public update = async (path: string) => {
    try {
      const setting: ILuisSettings = await this._getSettings();
      if (setting === null) return true;

      const name = await this._getAppName(path);
      const status = setting.status[name];
      if (status && status.status === FileState.UPDATED) {
        return true;
      }

      const newChecksum = await this._checksum(path);
      if (newChecksum !== status.checksum) {
        status.checksum = newChecksum;
        status.status = FileState.UPDATED;
      }
      setting.status[name] = status;
      await this._setSettings(setting);
      return true;
    } catch (error) {
      return error;
    }
  };

  public publish = async (authoringKey: string, luFiles: LUFile[]) => {
    const config = this._getConfig(authoringKey, luFiles);
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }

    //const settings: ILuisSettings = await this._getSettings();
    await runBuild(config);
    await this._setConfig(config);
    await this._setKey(authoringKey);
    await this._copyDialogsToTargetFolder(config);
    return await this._updateStatus(authoringKey, config);
  };

  public getAppsInfo = () => {};

  private _copyDialogsToTargetFolder = async (config: any) => {
    const defaultLanguage = settings.development.luisConfig.defaultLanguage;
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

  //remove this function next PR
  private _setKey = async (authoringKey: string) => {
    const keyPath = Path.join(this.generatedFolderPath, `key.json`);
    if (await this.storage.exists(keyPath)) {
      await this.storage.removeFile(keyPath);
    }

    await this.storage.writeFile(keyPath, JSON.stringify({ key: authoringKey }, null, 4));
  };

  private _updateStatus = async (authoringKey: string, config: IConfig) => {
    const credentials = new msRest.ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': authoringKey },
    });
    const client = new LuisAuthoring(credentials as any, {});
    const setting: ILuisSettings = await this._getSettings();
    setting.status = {};
    const names = keys(setting.luis);
    for (const name of names) {
      if (ENDPOINT_KEYS.indexOf(name) < 0) {
        const appInfo = await client.apps.get(
          config.authoringRegion as AzureRegions,
          'com' as AzureClouds,
          setting.luis[name]
        );
        setting.status[name] = { version: appInfo.activeVersion, checksum: '', status: FileState.LATEST };
      }
    }
    await this._setSettings(setting);
    return setting.status;
  };

  private _getSettingPath = () => {
    const config = settings.development.luisConfig;

    return Path.join(this.generatedFolderPath, `luis.settings.${config.environment}.${config.authoringRegion}.json`);
  };

  private _getAppName = async (path: string) => {
    const config = settings.development.luisConfig;
    const culture = this._getCultureFromPath(path) || config.defaultLanguage;
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

  private _getConfig = (authoringKey: string, luFiles: LUFile[]) => {
    const luConfig: any = settings.development.luisConfig as any;
    luConfig.models = [];
    luConfig.autodelete = true;
    luConfig.dialogs = true;
    luConfig.force = true;
    luConfig.folder = this.generatedFolderPath;
    luConfig.authoringKey = authoringKey;
    luFiles.forEach(file => {
      luConfig.models.push(Path.resolve(this.luPath, file.relativePath));
    });

    return luConfig;
  };

  private _setConfig = async (config: {}) => {
    const configPath = Path.join(this.generatedFolderPath, CONFIGNAME);
    await this.storage.writeFile(configPath, JSON.stringify(config, null, 4));
  };

  private _getSettings = async () => {
    const settingPath = this._getSettingPath();
    return await this._getJsonObject(settingPath);
  };

  private _setSettings = async (settings: ILuisSettings) => {
    const settingPath = this._getSettingPath();
    return await this.storage.writeFile(settingPath, JSON.stringify(settings, null, 4));
  };
}
