/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServerSettings } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import merge from 'lodash/merge';

import httpClient from '../../utils/httpUtil';
import { ServerSettingsState } from '../atoms/appState';

import { logMessage } from './shared';

export const serverSettingsDispatcher = () => {
  const fetchServerSettings = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const { data: settings } = await httpClient.get('/settings');

      set(ServerSettingsState, settings);
    } catch (error) {
      logMessage(callbackHelpers, `Error fetching data collection settings: ${error}`);
    }
  });

  const updateServerSettings = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (partialSettings: Partial<ServerSettings>) => {
      const { set, snapshot } = callbackHelpers;
      try {
        const currentSettings = await snapshot.getPromise(ServerSettingsState);
        const settings = merge({}, currentSettings, partialSettings);

        console.log('bfc', { partialSettings, currentSettings, settings });

        await httpClient.post('/settings', { settings });
        set(ServerSettingsState, settings);
      } catch (error) {
        logMessage(callbackHelpers, `Error fetching data collection settings: ${error}`);
      }
    }
  );

  return {
    fetchServerSettings,
    updateServerSettings,
  };
};
