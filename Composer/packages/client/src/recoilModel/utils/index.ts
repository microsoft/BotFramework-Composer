// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserSettings } from '@bfc/shared';
import merge from 'lodash/merge';

import storage from '../../utils/storage';
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
};

export const getUserSettings = (): UserSettings => {
  const loadedSettings = storage.get('userSettings') || {};
  const settings = merge(DEFAULT_USER_SETTINGS, loadedSettings);

  if (isElectron()) {
    // push the settings to the electron main process
    window.ipcRenderer.send('init-user-settings', settings);
  }

  return settings;
};
