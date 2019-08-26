import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants';

export const connectBot: ActionCreator = async (store, settings) => {
  const path = `${BASEURL}/launcher/connect`;
  try {
    await axios.get(path);
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
      },
    });
    await reloadBot(store, settings);
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const reloadBot: ActionCreator = async ({ dispatch }, settings) => {
  const path = `${BASEURL}/launcher/sync`;
  try {
    await axios.post(path, settings);
    dispatch({
      type: ActionTypes.RELOAD_BOT_SUCCESS,
      payload: {
        error: '',
      },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const startBot: ActionCreator = async ({ dispatch }, toStartBot) => {
  dispatch({
    type: ActionTypes.TO_START_BOT,
    payload: {
      toStartBot,
    },
  });
};
