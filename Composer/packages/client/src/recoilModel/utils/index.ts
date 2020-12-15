// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserSettings } from '@bfc/shared';
import merge from 'lodash/merge';

import { ClientStorage } from '../../utils/storage';
import { isElectron } from '../../utils/electronUtil';

export const DEFAULT_USER_SETTINGS = {
  appUpdater: {
    autoDownload: false,
    useNightly: false,
  },
  codeEditor: {
    lineNumbers: false,
    wordWrap: false,
    minimap: false,
  },
  propertyEditorWidth: 400,
  dialogNavWidth: 180,
  appLocale: 'en-US',
  telemetry: {},
};

const userSettingStorage = new ClientStorage<UserSettings>();

export const getUserSettings = (): UserSettings => {
  const loadedSettings = userSettingStorage.get('userSettings') ?? {};
  const settings = merge(DEFAULT_USER_SETTINGS, loadedSettings);

  if (isElectron()) {
    // push the settings to the electron main process
    window.ipcRenderer.send('init-user-settings', settings);
  }

  return settings;
};
