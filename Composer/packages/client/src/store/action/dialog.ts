import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo } from './navigation';

export const removeDialog: ActionCreator = async (store, id) => {
  try {
    const response = await axios.delete(`${BASEURL}/projects/opened/dialogs/${id}`);
    store.dispatch({
      type: ActionTypes.REMOVE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
    navTo(store, 'Main');
  } catch (err) {
    store.dispatch({ type: ActionTypes.REMOVE_DIALOG_FAILURE, payload: null, error: err });
  }
};

export const createDialog: ActionCreator = async (store, { id, content }) => {
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
    navTo(store, id);
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'CREATE DIALOG ERROR',
      },
    });
  }
};

export const updateDialog: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/dialogs/${id}`, { id, content });
    dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_DIALOG_FAILURE,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
      },
    });
  }
};

export const createDialogBegin: ActionCreator = ({ dispatch }, onComplete) => {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: {
      onComplete,
    },
  });
};

export const createDialogCancel: ActionCreator = store => {
  if (typeof store.state.onCreateDialogComplete === 'function') {
    store.state.onCreateDialogComplete(null);
  }
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG_CANCEL,
  });
};
