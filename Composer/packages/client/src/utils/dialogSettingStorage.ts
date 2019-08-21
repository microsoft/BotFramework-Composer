import { set } from 'lodash';

import { OAuthInput, ILuisConfig } from '../store/types';
import { LuisConfig } from '../constants';

import storage from './storage';

const KEY = 'DialogSetting';
const defaultLuisConfig = {
  LuisConfig: {
    [LuisConfig.PROJECT_NAME]: '',
    [LuisConfig.ENVIRONMENT]: '',
    [LuisConfig.AUTHORING_KEY]: '',
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
    this.check(value);
    this._all[botName] = value;
    this.storage.set(KEY, this._all);
  }
  check(value: any) {
    Object.keys(value).forEach(property => {
      if (DialogSettingStorage.defaultConfig.hasOwnProperty(property)) {
        if (property === 'OAuthInput' && !(value[property] as OAuthInput)) {
          value[property] = defaultOAuthConfig;
        } else if (property === 'LuisConfig' && !(value[property] as ILuisConfig)) {
          value[property] = defaultLuisConfig;
        }
      }
    });
  }
}

export default new DialogSettingStorage();
