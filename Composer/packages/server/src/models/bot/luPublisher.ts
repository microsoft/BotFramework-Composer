import crypto from 'crypto';

import { IConfig } from 'lubuild/typings/lib/IConfig';
import { findIndex, keys, values, replace } from 'lodash';
import { runBuild } from 'lubuild';
import { LuisAuthoring } from 'luis-apis';
import * as msRest from '@azure/ms-rest-js';
import { AzureClouds, AzureRegions } from 'luis-apis/typings/lib/models';

import luConfigTemplate from './../../store/luconfig.template.json';
import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisSettings, FileState } from './interface';

const CONFIGNAME = 'luconfig.json';
const ENDPOINT_KEYS = ['endpoint', 'endpointKey'];

export class LuPublisher {
  public luPath: string;
  public config: IConfig | null = null;
  public storage: IFileStorage;

  constructor(path: string, storage: IFileStorage) {
    this.luPath = path;
    this.storage = storage;
  }

  public add = async (path: string) => {
    const normalPath = this._getNormalPath(path);
    try {
      const config = await this._getConfig();

      if (config.models.indexOf(normalPath) < 0) {
        //Add relative path to the models
        config.models.push(normalPath);
        await this._setConfig(config);
      }
    } catch (error) {
      throw new Error('No luis file exist');
    }
  };

  public remove = async (path: string) => {
    try {
      const normalPath = this._getNormalPath(path);
      if (path === Path.resolve(__dirname, normalPath)) {
        const config = await this._getConfig();
        const index = config.models.indexOf(normalPath);

        if (index >= 0) {
          config.models.splice(index, 1);
          await this._setConfig(config);
        }
      }
      this._removeRemote(path);
    } catch (error) {
      return error;
    }
  };

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

  public publish = async (authoringKey: string) => {
    const config: IConfig = await this._getConfig();
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }

    const settings: ILuisSettings = await this._getSettings();

    if (settings !== null && findIndex(values(settings.status), { status: FileState.UPDATED }) >= 0) {
      config.force = true;
    }

    config.authoringKey = authoringKey;
    config.folder = this.luPath;
    config.models = config.models.map(item => Path.resolve(__dirname, item));
    await this._setKey(authoringKey);
    await runBuild(config);
    return await this._updateStatus(authoringKey, config);
  };

  public getAppsInfo = () => {};

  //remove this function next PR
  private _setKey = async (authoringKey: string) => {
    const keyPath = Path.join(this.luPath, `key.json`);
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

  //remove application from luis
  private _removeRemote = async (path: string) => {
    //TODO
  };

  private _getSettingPath = async () => {
    const config = await this._getConfig();

    return Path.join(this.luPath, `luis.settings.${config.environment}.${config.authoringRegion}.json`);
  };

  private _getNormalPath = (path: string) => {
    const culture = this._getCultureFromPath(path);
    if (culture !== null) {
      path = replace(path, culture + '.', '');
    }
    return Path.relative(__dirname, path);
  };

  private _getAppName = async (path: string) => {
    const config = await this._getConfig();
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

  private _getConfig = async () => {
    const configPath = Path.join(this.luPath, CONFIGNAME);

    if (this.config === null) {
      this.config = await this._getJsonObject(configPath);
    }

    if (this.config === null) {
      this.config = luConfigTemplate;
      await this.storage.writeFile(configPath, JSON.stringify(luConfigTemplate, null, 4));
    }

    return this.config;
  };

  private _setConfig = async (config: IConfig) => {
    const configPath = Path.join(this.luPath, CONFIGNAME);
    await this.storage.writeFile(configPath, JSON.stringify(config, null, 4));
  };

  private _getSettings = async () => {
    const settingPath = await this._getSettingPath();
    return await this._getJsonObject(settingPath);
  };

  private _setSettings = async (settings: ILuisSettings) => {
    const settingPath = await this._getSettingPath();
    return await this.storage.writeFile(settingPath, JSON.stringify(settings, null, 4));
  };
}
