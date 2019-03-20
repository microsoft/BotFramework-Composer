import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function toggleBot(status, dispatch) {
  const path = `launcher/${status === 'stopped' ? 'start' : 'stop'}`;
  try {
    await axios.get(`${BASEURL}/${path}`);
    dispatch({
      type: ActionTypes.BOT_STATUS_SET,
      status: status === 'stopped' ? 'running' : 'stopped',
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.BOT_STATUS_SET_FAILURE,
      payload: err,
    });
  }
}
