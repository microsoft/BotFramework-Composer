// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServerSettings } from '@bfc/shared';

import { Store } from '../store/store';

const KEY = 'settings';
export class SettingsService {
  public static getSettings(): ServerSettings {
    return Store.get(KEY, {});
  }

  public static setSettings(settings: ServerSettings): ServerSettings {
    Store.set(KEY, settings);
    return settings;
  }
}

export default SettingsService;
