import axios from 'axios';
import { get } from 'lodash';

import { ActionCreator, DialogSetting } from '../types';
import settingsStorage from '../../utils/dialogSettingStorage';
import { SensitiveProperties } from '../../constants';

import { BASEURL, ActionTypes } from './../../constants/index';
import { BotEnvironments } from './../../utils/envUtil';

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
    for (const property of SensitiveProperties) {
      const propertyValue = get(settings, property);
      settingsStorage.setField(botName, property, propertyValue ? propertyValue : '');
    }
    // set value to server
    const suffix = slot ? `/${slot}` : '';
    await axios.post(`${BASEURL}/projects/opened/settings${suffix}`, { settings });
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

export const setEditDialogSettings: ActionCreator = async ({ dispatch }, editing: boolean, slot?: BotEnvironments) => {
  if (editing) {
    // fetch the real settings for editing
    const suffix = slot ? `/${slot}` : '';
    const response = await axios.get(`${BASEURL}/projects/opened/settings${suffix}`);
    const settings = response.data;
    dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        settings,
      },
    });
  }
  dispatch({
    type: ActionTypes.SET_EDIT_DIALOG_SETTINGS,
    payload: editing,
  });
};

export const setDialogSettingsSlot: ActionCreator = async ({ dispatch }, slot: BotEnvironments, editing: boolean) => {
  try {
    const query = editing ? '' : '?obfuscate=true';
    const response = await axios.get(`${BASEURL}/projects/opened/settings/${slot}${query}`, { responseType: 'json' });
    const settings = response.data;

    dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        settings,
      },
    });

    dispatch({
      type: ActionTypes.SET_DIALOG_SETTINGS_SLOT,
      payload: slot,
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
