import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function toggleBot(dispatch, status) {
  const path = `launcher/${status === 'stopped' ? 'start' : 'stop'}`;
  try {
    await axios.get(`${BASEURL}/${path}`);
    dispatch({
      type: ActionTypes.BOT_STATUS_SET,
      payload: {
        status: status === 'stopped' ? 'running' : 'stopped',
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.BOT_STATUS_SET_FAILURE,
      payload: null,
      error: err,
    });
  }
}
