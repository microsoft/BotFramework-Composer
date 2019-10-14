import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants';

export const connectBot: ActionCreator = async (store, settings) => {
  const state = store.getState();
  const { botEnvironment } = state;
  const path = `${BASEURL}/launcher/connect?botEnvironment=${botEnvironment}`;

  try {
    const res = await axios.get(path);
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
        botEndpoint: res.data.botEndpoint,
      },
    });
    await reloadBot(store, settings);
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const reloadBot: ActionCreator = async ({ dispatch, getState }, settings) => {
  const { botEnvironment } = getState();
  const path = `${BASEURL}/launcher/sync`;
  try {
    const targetEnvironment = botEnvironment === 'integration' ? 'production' : 'integration';

    await axios.post(path, { ...settings, targetEnvironment });
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

export const startBot: ActionCreator = ({ dispatch }, toStartBot) => {
  dispatch({
    type: ActionTypes.TO_START_BOT,
    payload: {
      toStartBot,
    },
  });
};
