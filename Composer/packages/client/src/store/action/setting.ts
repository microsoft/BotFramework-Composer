import axios from 'axios';
import { get } from 'lodash';

import { ActionCreator, DialogSetting } from '../types';
import settingsStorage from '../../utils/dialogSettingStorage';
import { SensitiveProperties } from '../../constants';

import { BASEURL, ActionTypes } from './../../constants/index';
export const syncEnvSettings: ActionCreator = async ({ dispatch }, botName: string, settings: DialogSetting) => {
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
    await axios.post(`${BASEURL}/projects/opened/settings`, { settings });
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
