import { set } from 'lodash';

import storage, { ClientStorage } from './storage';
import { LuisConfig } from './../constants';

export interface LuisStorageConfig {
  [LuisConfig.PROJECT_NAME]: string;
  [LuisConfig.ENVIRONMENT]: string;
  [LuisConfig.AUTHORING_KEY]: string;
  authoringRegion: string;
  defaultLanguage: string;
}

class LuisStorage {
  static defaultConfig: LuisStorageConfig = {
    [LuisConfig.PROJECT_NAME]: '',
    [LuisConfig.ENVIRONMENT]: '',
    [LuisConfig.AUTHORING_KEY]: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
  };
  private storage: ClientStorage;
  private _all: { [botName: string]: LuisStorageConfig };

  constructor() {
    this.storage = storage;
    this._all = this.storage.get(LuisConfig.STORAGE_KEY, {});
  }

  get(botName: string): LuisStorageConfig {
    return this._all[botName] || LuisStorage.defaultConfig;
  }

  set(botName: string, field: string, value: string) {
    const current = this.get(botName);
    set(current, field, value);
    this._all[botName] = current;

    this.storage.set(LuisConfig.STORAGE_KEY, this._all);
  }
}

export default new LuisStorage();
