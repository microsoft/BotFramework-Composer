import { set } from 'lodash';

import { OAuthInput, ILuisConfig } from '../store/types';

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
  get(botName: string) {
    return this._all[botName] || DialogSettingStorage.defaultConfig;
  }
  setField(botName: string, field: string, value: { OAuthInput: OAuthInput; LuisConfig: ILuisConfig }) {
    const current = this._all[botName];
    set(current, field, value);
    this._all[botName] = current;
    this.storage.set(KEY, this._all);
  }
  remove(botName: string) {
    delete this._all[botName];
    this.storage.set(KEY, this._all);
  }
  set(botName: string, value: { OAuthInput: OAuthInput; LuisConfig: ILuisConfig }) {
    this._all[botName] = value;
    this.storage.set(KEY, this._all);
  }
}

export default new DialogSettingStorage();
