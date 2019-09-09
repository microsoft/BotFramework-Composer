import { has, set } from 'lodash';

import { Path } from '../../utility/path';
import { LocalDiskStorage } from '../storage/localDiskStorage';

import { DialogSetting } from './interface';

const keyword: any = ['MicrosoftAppPassword', 'luis.authoringKey', 'luis.endpointKey'];
const subPath = 'settings/appsettings.json';
const defaultSetting: DialogSetting = {
  MicrosoftAppPassword: '',
  MicrosoftAppId: '',
  luis: {
    name: '',
    authoringKey: '',
    endpointKey: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
    environment: 'composer',
  },
};
export class SettingManager {
  private path: string;
  private storage: LocalDiskStorage;
  private settings: DialogSetting | null;
  constructor(path: string) {
    this.path = Path.join(path, subPath);
    this.storage = new LocalDiskStorage();
    this.settings = null;
  }
  public get = async () => {
    if (this.settings) {
      return this.settings;
    } else {
      this.settings = await this._getFromStorage();
      return this.settings;
    }
  };
  private _getFromStorage = async () => {
    if (await this.storage.exists(this.path)) {
      const file = await this.storage.readFile(this.path);
      return JSON.parse(file);
    } else {
      // does not have setting file, return default value
      await this.set(defaultSetting);
      return defaultSetting;
    }
  };
  public set = async (config: DialogSetting) => {
    const dir = Path.dirname(this.path);
    if (!(await this.storage.exists(dir))) {
      await this.storage.mkDir(dir, { recursive: true });
    }
    this.filterSensitive(config);
    await this.storage.writeFile(this.path, JSON.stringify(config, null, 2));
  };
  private filterSensitive = (config: DialogSetting) => {
    if (typeof config !== 'object') {
      return config;
    }
    for (const key of keyword) {
      if (has(config, key)) {
        set(config, key, '');
      }
    }
  };
}
