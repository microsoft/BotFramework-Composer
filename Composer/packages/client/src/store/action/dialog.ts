import axios from 'axios';

import { ActionCreator, State } from '../types';
import { undoable } from '../middlewares/undo';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo } from './navigation';

export const removeDialog: ActionCreator = async (store, { id }) => {
  try {
    const response = await axios.delete(`${BASEURL}/projects/opened/dialogs/${id}`);
    store.dispatch({
      type: ActionTypes.REMOVE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
    navTo(store, { dialogId: 'Main' });
  } catch (err) {
    store.dispatch({ type: ActionTypes.REMOVE_DIALOG_FAILURE, payload: null, error: err });
  }
};

export const createDialog: ActionCreator = async (store, { id, content }) => {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/dialogs`, { id, content });
    const onCreateDialogComplete = store.getState().onCreateDialogComplete;
    if (typeof onCreateDialogComplete === 'function') {
      onCreateDialogComplete(id);
    }
    store.dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
    navTo(store, { dialogId: id });
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

export const updateDialogBase: ActionCreator = async ({ dispatch }, { id, content }) => {
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

export const updateDialog: ActionCreator = undoable(
  updateDialogBase,
  (state: State, args, isEmpty) => {
    if (isEmpty) {
      const id = state.designPageLocation.dialogId;
      const dialog = state.dialogs.find(dialog => dialog.id === id);
      return { id, content: dialog ? dialog.content : {} };
    } else {
      return args;
    }
  },
  updateDialogBase,
  updateDialogBase
);

export const createDialogBegin: ActionCreator = ({ dispatch }, { onComplete }) => {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: {
      onComplete,
    },
  });
};

export const createDialogCancel: ActionCreator = store => {
  const onCreateDialogComplete = store.getState().onCreateDialogComplete;
  if (typeof onCreateDialogComplete === 'function') {
    onCreateDialogComplete(null);
  }
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG_CANCEL,
  });
};
