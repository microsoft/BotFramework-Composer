import { set } from 'lodash';

import storage from './storage';

const KEY = 'DialogSetting';
const defaultLuisConfig = {
  LuisConfig: {
    name: '',
    environment: '',
    authoringKey: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
  },
};
const defaultOAuthConfig = {
  OAuthInput: {
    MicrosoftAppId: '',
    MicrosoftAppPassword: '',
  },
};

class DialogSettingStorage {
  static defaultConfig = {
    ...defaultOAuthConfig,
    ...defaultLuisConfig,
  };
  private storage;
  private _all;
  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }
  get(botName) {
    return this._all[botName] || DialogSettingStorage.defaultConfig;
  }
  setField(botName, field, value) {
    const current = this._all[botName];
    set(current, field, value);
    this._all[botName] = current;
    this.storage.set(KEY, this._all);
  }
  remove(botName) {
    delete this._all[botName];
    this.storage.set(KEY, this._all);
  }
  set(botName, value) {
    this._all[botName] = value;
    this.storage.set(KEY, this._all);
  }
}

export default new DialogSettingStorage();
