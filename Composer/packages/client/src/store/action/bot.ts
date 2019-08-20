import axios from 'axios';

import { ActionCreator } from '../types';

import oauthStorage from './../../utils/oauthStorage';
import { BASEURL, ActionTypes } from './../../constants';
import LuisStorage from './../../utils/luisStorage';

export const connectBot: ActionCreator = async (store, botName) => {
  const path = `${BASEURL}/launcher/connect`;
  try {
    await axios.get(path);
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
      },
    });
    await reloadBot(store, botName);
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const reloadBot: ActionCreator = async ({ dispatch }, botName) => {
  const path = `${BASEURL}/launcher/sync`;
  try {
    await axios.post(path, { luis: LuisStorage.get(botName), ...oauthStorage.get(botName).OAuthInput });
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
