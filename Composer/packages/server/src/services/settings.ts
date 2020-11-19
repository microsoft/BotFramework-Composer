// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServerSettings } from '@bfc/shared';

import { Store } from '../store/store';

const KEY = 'settings';

const DEFAULT_SETTINGS: ServerSettings = {
  telemetry: {
    allowDataCollection: null,
  },
};

export class SettingsService {
  public static getSettings(): ServerSettings {
    return Store.get(KEY, DEFAULT_SETTINGS);
  }

  public static setSettings(settings: ServerSettings): ServerSettings {
    Store.set(KEY, settings);
    return settings;
  }
}

export default SettingsService;
