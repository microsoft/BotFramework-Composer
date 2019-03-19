import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchFiles(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/fileserver`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: response,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: err,
    });
  }
}

export function updateFiles(payload, dispatch) {
  dispatch({
    type: ActionTypes.FILES_UPDATE,
    payload,
  });
}
