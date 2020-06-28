// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties } from '@bfc/shared';
import has from 'lodash/has';
import get from 'lodash/get';

import settingStorage from '../../utils/dialogSettingStorage';
import { runtimeSettingsState } from '../atoms/appState';

import { settingsState } from './../atoms/botState';
import { runtimeTemplatesState } from './../atoms/appState';
import httpClient from './../../utils/httpUtil';

export const ejectDispatcher = () => {
  const getRuntimeTemplates = useRecoilCallback<[], Promise<void>>(({ set }: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/runtime/templates`);
      set(runtimeTemplatesState, response.data);
    } catch (error) {
      //TODO: error
      console.log(error);
    }
  });

  const ejectRuntime = useRecoilCallback<[string, string], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async (projectId: string, name: string) => {
      try {
        const response = await httpClient.post(`/runtime/eject/${projectId}/${name}`);
        set(runtimeSettingsState, response.data);
        if (response.data.settings && response.data.settings.path) {
          const oldSettings = await snapshot.getPromise(settingsState);
          const newSettings = {
            ...oldSettings,
            runtime: {
              ...oldSettings.runtime,
              customRuntime: true,
              path: response.data.settings.path,
              command: response.data.settings.startCommand,
            },
          };
          // set value in local storage
          for (const property of SensitiveProperties) {
            if (has(newSettings, property)) {
              const propertyValue = get(newSettings, property, '');
              settingStorage.setField(projectId, property, propertyValue);
            }
          }
        }
      } catch (err) {
        //TODO: error
        console.log(err);
      }
    }
  );

  return {
    getRuntimeTemplates,
    ejectRuntime,
  };
};
