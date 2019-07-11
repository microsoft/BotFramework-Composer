import axios from 'axios';

import oauthStorage from './../../utils/oauthStorage';
import { BASEURL, ActionTypes } from './../../constants/index';
import LuisStorage from './../../utils/luisStorage';

export async function connectBot(dispatch, botName) {
  const path = `${BASEURL}/launcher/connect`;
  try {
    await axios.get(path);
    dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
      },
    });
    await reloadBot(dispatch, botName);
  } catch (err) {
    dispatch({
      type: ActionTypes.CONNECT_BOT_FAILURE,
      payload: {
        error: err,
      },
    });
  }
}

export async function reloadBot(dispatch, botName) {
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
    dispatch({
      type: ActionTypes.RELOAD_BOT_FAILURE,
      payload: {
        error: err.response.data.error,
      },
    });
  }
}
