// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator, DialogSetting } from '../types';

import { ActionTypes } from './../../constants/index';
import { BotEnvironments } from './../../utils/envUtil';
import httpClient from './../../utils/httpUtil';

export const setSettings: ActionCreator = async (
  { dispatch },
  projectId: string,
  botName: string,
  settings: DialogSetting
) => {
  dispatch({
    type: ActionTypes.SYNC_ENV_SETTING,
    payload: {
      projectId,
      settings
    }
  });
};

export const setDialogSettingsSlot = async ({ dispatch }, projectId: string, slot?: BotEnvironments) => {
  const suffix = slot ? `/${slot}` : '';
  const url = `/projects/${projectId}/settings${suffix}`;

  try {
    const response = await httpClient.get(url);
    const settings = response.data;
    dispatch({
      type: ActionTypes.GET_ENV_SETTING,
      payload: {
        settings
      }
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.reponse.data.message : err,
        summary: 'DLG SETTINGS ERROR'
      }
    });
  }
};
