// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import has from 'lodash/has';
import { SensitiveProperties as defaultSensitiveProperties } from '@bfc/shared';

import { ActionCreator, DialogSetting } from '../types';
import settingsStorage from '../../utils/dialogSettingStorage';

import { ActionTypes } from './../../constants/index';
import { BotEnvironments } from './../../utils/envUtil';
import httpClient from './../../utils/httpUtil';

export const setSettings: ActionCreator = async (
  { dispatch },
  botName: string,
  settings: DialogSetting,
  slot?: BotEnvironments
) => {
  try {
    // set value to store
    dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        settings,
      },
    });
    // set value in local storage
    const SensitiveProperties = settings.SensitiveProperties || defaultSensitiveProperties;
    for (const property of SensitiveProperties) {
      if (has(settings, property)) {
        const propertyValue = get(settings, property);
        settingsStorage.setField(botName, property, propertyValue ? propertyValue : '');
      }
    }
    // set value to server
    const suffix = slot ? `/${slot}` : '';
    await httpClient.post(`/projects/opened/settings${suffix}`, { settings });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'SYNC CONFIG ERROR',
      },
    });
  }
};

export const setDialogSettingsSlot = async ({ dispatch }, editing: boolean, slot?: BotEnvironments) => {
  const suffix = slot ? `/${slot}` : '';
  const query = editing ? '' : '?obfuscate=true';
  const url = `/projects/opened/settings${suffix}${query}`;

  try {
    const response = await httpClient.get(url);
    const settings = response.data;
    dispatch({
      type: ActionTypes.GET_ENV_SETTING,
      payload: {
        settings,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.reponse.data.message : err,
        summary: 'DLG SETTINGS ERROR',
      },
    });
  }
};

export const setEditDialogSettings: ActionCreator = async (store, editing: boolean, slot?: BotEnvironments) => {
  if (editing) {
    // fetch the real settings for editing
    await setDialogSettingsSlot(store, editing, slot);
  }
};
