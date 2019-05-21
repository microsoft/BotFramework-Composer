import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { clearNavHistory } from './navigation';

export async function connectBot(dispatch) {
  const path = `${BASEURL}/launcher/connect`;
  try {
    await axios.get(path);
    dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CONNECT_BOT_FAILURE,
      payload: {
        error: err,
      },
    });
  }
}

export async function reloadBot(dispatch) {
  const path = `${BASEURL}/launcher/sync`;
  try {
    await axios.get(path);
    dispatch({
      type: ActionTypes.RELOAD_BOT_SUCCESS,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.RELOAD_BOT_FAILURE,
    });
  }
}

export function closeCurrentProject(dispatch) {
  clearNavHistory(dispatch);
  dispatch({
    type: ActionTypes.INIT_PROJECT_STATE,
  });
}
