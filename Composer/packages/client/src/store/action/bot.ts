import axios from 'axios';

import { ActionCreator } from '../types';

import oauthStorage from './../../utils/oauthStorage';
import { BASEURL, ActionTypes } from './../../constants';
import LuisStorage from './../../utils/luisStorage';

export const connectBot: ActionCreator = async (store, botName) => {
  const botEnvironment = store.state.botEnvironment;
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
    await reloadBot(store, botName);
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const reloadBot: ActionCreator = async ({ state, dispatch }, botName) => {
  const { botEnvironment } = state;
  const path = `${BASEURL}/launcher/sync`;
  try {
    const targetEnvironment = botEnvironment === 'integration' ? 'production' : 'integration';

    await axios.post(path, { luis: LuisStorage.get(botName), ...oauthStorage.get().OAuthInput, targetEnvironment });
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
