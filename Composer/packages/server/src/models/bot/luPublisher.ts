import { IConfig } from 'lubuild/typings/lib/IConfig';
import { keys, replace } from 'lodash';
import { runBuild } from 'lubuild';
import { LuisAuthoring } from 'luis-apis';
import * as msRest from '@azure/ms-rest-js';
import { AzureClouds, AzureRegions } from 'luis-apis/typings/lib/models';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisSettings, FileState, LUFile, ILuisConfig } from './interface';

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

  public update = async (isUpdated: boolean, path: string, config: ILuisConfig) => {
    if (!isUpdated) return;

    this.setLuisConfig(config);
    const setting: ILuisSettings = await this._getSettings();
    if (setting === null) return;

    const name = await this._getAppName(path);
    if (!name) return;

    const status = setting.status[name];
    if (status && status.state === FileState.UNPUBLISHED) {
      return;
    }

    status.state = FileState.UNPUBLISHED;
    setting.status[name] = status;
    await this._setSettings(setting);
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

  public getUnpublisedFiles = async (files: LUFile[]) => {
    const setting: ILuisSettings = await this._getSettings();
    if (setting === null) return files;
    const result: LUFile[] = [];
    for (const file of files) {
      const appName = this._getAppName(file.id);
      // //if no generated files, no status, check file's checksum
      if (
        !(await this.storage.exists(`${this.generatedFolderPath}/${appName.split('_').join('.')}.dialog`)) ||
        !setting.status[appName] ||
        setting.status[appName].state === FileState.UNPUBLISHED
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
    const settings = await this._getSettings();
    if (settings === null) return [];
    const status = settings.status;
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
    setting.status = {};
    const names = keys(setting.luis);
    for (const name of names) {
      if (ENDPOINT_KEYS.indexOf(name) < 0) {
        const appInfo = await client.apps.get(
          config.authoringRegion as AzureRegions,
          'com' as AzureClouds,
          setting.luis[name]
        );
        setting.status[name] = { version: appInfo.activeVersion, state: FileState.PUBLISHED };
      }
    }
    await this._setSettings(setting);
    return setting.status;
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

  private _setSettings = async (settings: ILuisSettings) => {
    const settingPath = await this._getSettingPath();
    return await this.storage.writeFile(settingPath, JSON.stringify(settings, null, 4));
  };
}
