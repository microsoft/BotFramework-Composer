import { set } from 'lodash';

import storage from './storage';
import { LuisConfig } from './../constants';

class LuisStorage {
  static defaultConfig = {
    [LuisConfig.PROJECT_NAME]: '',
    [LuisConfig.ENVIRONMENT]: '',
    [LuisConfig.AUTHORING_KEY]: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
  };

  constructor() {
    this.storage = storage;
    this._all = this.storage.get(LuisConfig.STORAGE_KEY, {});
  }

  get(botName) {
    return this._all[botName] || LuisStorage.defaultConfig;
  }

  set(botName, field, value) {
    const current = this.get(botName);
    set(current, field, value);
    this._all[botName] = current;

    this.storage.set(LuisConfig.STORAGE_KEY, this._all);
  }

  remove(botName) {
    delete this._all[botName];
    this.storage.set(LuisConfig.STORAGE_KEY, this._all);
  }
}

export default new LuisStorage();
