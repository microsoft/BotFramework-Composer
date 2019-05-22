import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchSettings(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/settings`);
    dispatch({
      type: ActionTypes.GET_SETTINGS_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_SETTINGS_FAILURE,
      payload: null,
      error: err,
    });
  }
}
