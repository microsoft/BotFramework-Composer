// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import has from 'lodash/has';
import { SensitiveProperties } from '@bfc/shared';

import { ActionCreator, DialogSetting } from '../types';
import settingsStorage from '../../utils/dialogSettingStorage';

import { ActionTypes } from './../../constants/index';
import { BotEnvironments } from './../../utils/envUtil';
import httpClient from './../../utils/httpUtil';

export const setSettings: ActionCreator = async (
  { dispatch },
  projectId: string,
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
    for (const property of SensitiveProperties) {
      if (has(settings, property)) {
        const propertyValue = get(settings, property, '');
        settingsStorage.setField(botName, property, propertyValue);
      }
    }
    // set value to server
    const suffix = slot ? `/${slot}` : '';
    await httpClient.post(`/projects/${projectId}/settings/${suffix}`, { settings });
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

export const setDialogSettingsSlot = async (
  { dispatch },
  projectId: string,
  editing: boolean,
  slot?: BotEnvironments
) => {
  const suffix = slot ? `/${slot}` : '';
  const query = editing ? '' : '?obfuscate=true';
  const url = `/projects/${projectId}/settings${suffix}${query}`;

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

export const setEditDialogSettings: ActionCreator = async (
  store,
  projectId: string,
  editing: boolean,
  slot?: BotEnvironments
) => {
  if (editing) {
    // fetch the real settings for editing
    await setDialogSettingsSlot(store, projectId, editing, slot);
  }
};
