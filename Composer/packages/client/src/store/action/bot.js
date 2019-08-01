import axios from 'axios';

import oauthStorage from './../../utils/oauthStorage';
import { BASEURL, ActionTypes } from './../../constants/index';
import LuisStorage from './../../utils/luisStorage';

export async function connectBot(store, botName) {
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
}

export async function reloadBot({ dispatch }, botName) {
  const path = `${BASEURL}/launcher/sync`;
  try {
    await axios.post(path, { luis: LuisStorage.get(botName), ...oauthStorage.get().OAuthInput });
    dispatch({
      type: ActionTypes.RELOAD_BOT_SUCCESS,
      payload: {
        error: '',
      },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
}

export async function startBot({ dispatch }, toStartBot) {
  dispatch({
    type: ActionTypes.TO_START_BOT,
    payload: {
      toStartBot,
    },
  });
}
