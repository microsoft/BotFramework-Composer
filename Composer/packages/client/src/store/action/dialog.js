import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, clearNavHistory } from './navigation';

export async function createDialog(dispatch, { name, steps }) {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/dialogs`, { name, steps });
    dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: { response },
    });
    clearNavHistory(dispatch);
    navTo(dispatch, `${name}#`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export async function updateDialog(dispatch, { name, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/dialogs/${name}`, { name, content });
    dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_DIALOG_FAILURE,
      payload: null,
      error: err,
    });
  }
}
