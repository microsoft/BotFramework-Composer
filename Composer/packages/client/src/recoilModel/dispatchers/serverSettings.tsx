/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { produce } from 'immer';

import httpClient from '../../utils/httpUtil';
import { ServerSettingsState } from '../atoms/appState';

import { logMessage } from './shared';

export const serverSettingsDispatcher = () => {
  const setAllowDataCollection = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (allowDataCollection: boolean) => {
      const { set, snapshot } = callbackHelpers;
      try {
        const currentSettings = await snapshot.getPromise(ServerSettingsState);

        const settings = produce(currentSettings, (current) => ({
          ...current,
          telemetry: {
            ...current.telemetry,
            allowDataCollection,
          },
        }));

        await httpClient.post('/settings', { settings });
        set(ServerSettingsState, settings);
      } catch (error) {
        logMessage(callbackHelpers, `Error fetching data collection settings: ${error}`);
      }
    }
  );

  const fetchServerSettings = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const { data: settings } = await httpClient.get('/settings');

      set(ServerSettingsState, settings);
    } catch (error) {
      logMessage(callbackHelpers, `Error fetching data collection settings: ${error}`);
    }
  });

  return {
    fetchServerSettings,
    setAllowDataCollection,
  };
};
