// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ActionCreator, State } from '../types';
import { undoable } from '../middlewares/undo';

import { ActionTypes } from './../../constants/index';
import { Store } from './../types';

export const removeDialog: ActionCreator = (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_DIALOG,
    payload: { id },
  });
};

export const createDialog: ActionCreator = async (store, { id, content }) => {
  const onCreateDialogComplete = store.getState().onCreateDialogComplete;
  if (typeof onCreateDialogComplete === 'function') {
    setTimeout(() => onCreateDialogComplete(id));
  }
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG,
    payload: { id, content },
  });
};

export const updateDialogBase: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_DIALOG,
    payload: { id, content },
  });
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
  (store: Store, from, to) => updateDialogBase(store, ...to),
  (store: Store, from, to) => updateDialogBase(store, ...to)
);

export const createDialogBegin: ActionCreator = ({ dispatch }, actions, onComplete) => {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: {
      actionsSeed: actions,
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
