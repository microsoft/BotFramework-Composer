import axios from 'axios';

import { ActionCreator, DialogSetting } from '../types';

import { BASEURL, ActionTypes } from './../../constants/index';

export const setEnvSettings: ActionCreator = async ({ dispatch }, settings: DialogSetting) => {
  try {
    dispatch({
      type: ActionTypes.UPDATE_ENV_SETTING,
      payload: {
        settings,
      },
    });
    await axios.post(`${BASEURL}/projects/opened/settings`, { settings });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'SET CONFIG ERROR',
      },
    });
  }
};
export const setEnvSettingUpdated: ActionCreator = async ({ dispatch }) => {
  try {
    dispatch({
      type: ActionTypes.UPDATE_LUIS_SETTING,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'SET LUIS CONFIG ERROR',
      },
    });
  }
};
