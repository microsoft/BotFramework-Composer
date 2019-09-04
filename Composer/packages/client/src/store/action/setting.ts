import axios from 'axios';

import { ActionCreator, DialogSetting } from '../types';

import { BASEURL, ActionTypes } from './../../constants/index';

export const syncEnvSettings: ActionCreator = async ({ dispatch }, settings: DialogSetting) => {
  try {
    await axios.post(`${BASEURL}/projects/opened/settings`, { settings });
    dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        settings,
      },
    });
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

export const setEnvSettings: ActionCreator = async ({ dispatch }) => {
  try {
    dispatch({
      type: ActionTypes.UPDATE_ENV_SETTING,
    });
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
