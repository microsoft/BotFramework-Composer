// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserSettings } from '@bfc/shared';
import merge from 'lodash/merge';

import storage from '../../utils/storage';
import { isElectron } from '../../utils/electronUtil';

import { getDefaultFontSettings } from './fontUtil';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

export const DEFAULT_USER_SETTINGS = {
  appUpdater: {
    autoDownload: false,
    useNightly: false,
  },
  codeEditor: {
    lineNumbers: false,
    wordWrap: false,
    minimap: false,
    fontSettings: DEFAULT_FONT_SETTINGS,
  },
  propertyEditorWidth: 400,
  dialogNavWidth: 180,
  appLocale: 'en-US',
  telemetry: {},
};

export const getUserSettings = (): UserSettings => {
  const loadedSettings = storage.get('userSettings', {});
  const settings = merge(DEFAULT_USER_SETTINGS, loadedSettings);

  if (isElectron()) {
    // push the settings to the electron main process
    window.ipcRenderer.send('init-user-settings', settings);
  }

  return settings;
};
