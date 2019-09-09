import axios from 'axios';
import clonedeep from 'lodash.clonedeep';
import { remove } from 'lodash';

import { ActionCreator, State, DialogInfo } from '../types';
import { undoable, Pick } from '../middlewares/undo';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo } from './navigation';

export const removeDialogBase: ActionCreator = async (store, id) => {
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

export const createDialogBase: ActionCreator = async (store, { id, content }) => {
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

const pickDialog: Pick = (state: State, args: any[], isStackEmpty) => {
  const id = args[0];
  const dialog = state.dialogs.find(dialog => dialog.id === id);
  const dialogs = clonedeep(state.dialogs);
  if (!isStackEmpty) {
    remove(dialogs, (item: DialogInfo) => item.id === id);
  }
  return [{ id, content: dialog ? dialog.content : {}, dialogs }];
};

const getDiff = (dialogs1: DialogInfo[], dialogs2: DialogInfo[]) => {
  const temp = [];
  dialogs1.forEach(dialog => {
    temp[dialog.id] = true;
  });
  for (const dialog of dialogs2) {
    if (!temp[dialog.id]) {
      return { id: dialog.id, content: dialog.content };
    }
  }
};

export const removeDialog = undoable(
  removeDialogBase,
  pickDialog,
  async (store, { dialogs }) => {
    const target = getDiff(store.getState().dialogs, dialogs);
    if (target) {
      await createDialogBase(store, target);
    }
  },
  (store, { id }) => removeDialogBase(store, id)
);

export const createDialog = undoable(
  createDialogBase,
  pickDialog,
  async (store, { dialogs }) => {
    const target = getDiff(dialogs, store.getState().dialogs);
    if (target) {
      await removeDialogBase(store, target.id);
    }
  },
  createDialogBase
);

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
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = state.designPageLocation.dialogId;
      const dialog = state.dialogs.find(dialog => dialog.id === id);
      return [{ id, content: dialog ? dialog.content : {} }];
    } else {
      return args;
    }
  },
  updateDialogBase,
  updateDialogBase
);

export const createDialogBegin: ActionCreator = ({ dispatch }, onComplete) => {
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
