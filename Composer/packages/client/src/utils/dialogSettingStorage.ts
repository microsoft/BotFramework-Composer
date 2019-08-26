import { set } from 'lodash';

// import { OAuthInput, ILuisConfig } from '../store/types';

import storage from './storage';

const KEY = 'DialogSetting';

class DialogSettingStorage {
  private storage;
  private _all;
  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }
  get(botName: string) {
    return this._all[botName] || {};
  }
  setField(botName: string, field: string, value: any) {
    let current = this._all[botName];
    if (!current) {
      current = {};
    }
    set(current, field, value);
    this._all[botName] = current;
    this.storage.set(KEY, this._all);
  }
  remove(botName: string) {
    delete this._all[botName];
    this.storage.set(KEY, this._all);
  }
  // set(botName: string, value: { OAuthInput: OAuthInput; LuisConfig: ILuisConfig }) {
  //   this._all[botName] = value;
  //   this.storage.set(KEY, this._all);
  // }
}

export default new DialogSettingStorage();
