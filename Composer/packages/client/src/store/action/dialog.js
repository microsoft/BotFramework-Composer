import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, clearNavHistory } from './navigation';

export async function removeDialog(store, id) {
  try {
    const response = await await axios.delete(`${BASEURL}/projects/opened/dialogs/${id}`);
    store.dispatch({
      type: ActionTypes.REMOVE_DIALOG_SUCCESS,
      payload: { response },
    });
    clearNavHistory(store);
    navTo(store, 'Main#');
  } catch (err) {
    store.dispatch({
      type: ActionTypes.REMOVE_DIALOG_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function createDialog(store, { id, content }) {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/dialogs`, {
      id,
      content,
    });
    if (typeof store.state.onCreateDialogComplete === 'function') {
      store.state.onCreateDialogComplete(id);
    }
    store.dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'CREATE DIALOG ERROR',
      },
    });
  }
}

export async function updateDialog({ dispatch }, { id, content }) {
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
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'UPDATE DIALOG ERROR',
      },
    });
  }
}

export function createDialogBegin({ dispatch }, onComplete) {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: {
      onComplete,
    },
  });
}

export function createDialogCancel({ dispatch }) {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_CANCEL,
  });
}
