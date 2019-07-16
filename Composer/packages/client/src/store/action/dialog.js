import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, clearNavHistory } from './navigation';

export async function createDialog(dispatch, { id, content }) {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/dialogs`, {
      id,
      content,
    });
    dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
    clearNavHistory(dispatch);
    navTo(dispatch, `${id}#`);
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR_MESSAGE,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'CREATE DIALOG ERROR',
      },
    });
  }
}

export async function updateDialog(dispatch, { id, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/dialogs/${id}`, {
      id,
      content,
    });
    dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR_MESSAGE,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'UPDATE DIALOG ERROR',
      },
    });
  }
}
