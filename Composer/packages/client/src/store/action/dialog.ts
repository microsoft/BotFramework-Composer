// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator, State } from '../types';
import { undoable } from '../middlewares/undo';
import { FileChangeType } from '../middlewares/persistence/types';

import { removeLgFile, createLgFile } from './lg';
import { ActionTypes } from './../../constants/index';
import { navTo } from './navigation';
import { Store } from './../types';
import { createLuFile, removeLuFile } from './lu';

export const removeDialogBase: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_DIALOG,
    payload: {
      id,
      changeType: FileChangeType.DELETE,
      name: `${id}.dialog`,
    },
  });
  removeLgFile(store, id);
  removeLuFile(store, id);
  navTo(store, 'Main');
};

//createDialog function need to create lg, lu and dialog
export const createDialogBase: ActionCreator = async (store, { id, content, lgContent = '', luContent = '' }) => {
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG,
    payload: {
      id,
      content,
      changeType: FileChangeType.CREATE,
      name: `${id}.dialog`,
    },
  });
  createLgFile(store, { id, content: lgContent });
  createLuFile(store, { id, content: luContent });
  navTo(store, id);
};

export const removeDialog = undoable(
  removeDialogBase,
  (state: State, args: any[], isStackEmpty) => {
    const id = args[0];
    const dialog = state.dialogs.find(dialog => dialog.id === id);
    const lg = state.lgFiles.find(lg => lg.id === id);
    const lu = state.luFiles.find(lu => lu.id === id);
    return [{ id, content: dialog?.content || '', lgContent: lg?.content, luContent: lu?.content }];
  },
  async (store: Store, { id, content, lgContent, luContent }) => {
    await createDialogBase(store, { id, content, lgContent, luContent });
  },
  (store, { id }) => removeDialogBase(store, id)
);

export const createDialog = undoable(
  createDialogBase,
  (state: State, args: any[]) => {
    const { id, content, lgContent, luContent } = args[0];
    return [{ id, content, lgContent, luContent }];
  },
  async (store: Store, { id }) => {
    await removeDialogBase(store, id);
  },
  (store, { id, content, lgContent, luContent }) => createDialogBase(store, { id, content, lgContent, luContent })
);

export const updateDialogBase: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_DIALOG,
    payload: {
      id,
      content,
      changeType: FileChangeType.UPDATE,
      name: `${id}.dialog`,
    },
  });
  navTo(store, id);
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

export const createDialogBegin: ActionCreator = ({ dispatch }, { actions }) => {
  dispatch({
    type: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: {
      actionsSeed: actions,
    },
  });
};

export const createDialogCancel: ActionCreator = store => {
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG_CANCEL,
  });
};
