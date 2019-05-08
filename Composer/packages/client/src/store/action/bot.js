import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { clearNavHistory } from './navigation';

export async function toggleBot(dispatch, status) {
  const path = `launcher/${status === 'stopped' ? 'start' : 'stop'}`;
  try {
    await axios.get(`${BASEURL}/${path}`);
    dispatch({
      type: ActionTypes.SET_BOT_STATUS_SUCCESS,
      payload: {
        status: status === 'stopped' ? 'running' : 'stopped',
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_BOT_STATUS_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export function closeCurrentProject(dispatch) {
  clearNavHistory(dispatch);
  dispatch({
    type: ActionTypes.INIT_PROJECT_STATE,
  });
}
