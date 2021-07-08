/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import pick from 'lodash/pick';

import { userSettingsState } from '../atoms/appState';
import storage from '../../utils/storage';
import { loadLocale } from '../../utils/fileUtil';
import { UserSettingsPayload } from '../types';
import { isElectron } from '../../utils/electronUtil';
import httpClient from '../../utils/httpUtil';

import { logMessage } from './shared';

export const userDispatcher = () => {
  const updateUserSettings = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (settings: Partial<UserSettingsPayload> = {}) => {
      const { set } = callbackHelpers;
      if (settings.appLocale != null) {
        await loadLocale(settings.appLocale);
      }
      set(userSettingsState, (currentSettings) => {
        const newSettings = {
          ...currentSettings,
        };
        for (const key in settings) {
          if (newSettings[key] != null) {
            if (typeof newSettings[key] === 'object') {
              newSettings[key] = { ...newSettings[key], ...settings[key] };
            } else {
              newSettings[key] = settings[key];
            }
          }
        }
        storage.set('userSettings', newSettings);

        // push telemetry settings to the server
        httpClient.post('/settings', { settings: pick(newSettings, ['telemetry']) }).catch((error) => {
          logMessage(callbackHelpers, `Error updating server settings: ${error}`);
        });

        if (isElectron()) {
          // push the settings to the electron main process
          window.ipcRenderer.send('update-user-settings', newSettings);
        }

        return newSettings;
      });
    }
  );

  return {
    updateUserSettings,
  };
};
