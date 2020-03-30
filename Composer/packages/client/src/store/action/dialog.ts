// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { autofixReferInDialog } from '@bfc/indexers';

import { ActionCreator, State } from '../types';
import { undoable } from '../middlewares/undo';
import { getBaseName } from '../../utils/fileUtil';

import { removeLgFile, createLgFile } from './lg';
import { ActionTypes } from './../../constants/index';
import { navTo } from './navigation';
import { Store } from './../types';
import { createLuFile, removeLuFile } from './lu';

interface FileResource {
  id: string;
  content: string;
}

export const removeDialogBase: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_DIALOG,
    payload: { id },
  });
};

export const createDialogBase: ActionCreator = async (store, { id, content }) => {
  const fixedContent = autofixReferInDialog(id, content);
  const onCreateDialogComplete = store.getState().onCreateDialogComplete;
  if (typeof onCreateDialogComplete === 'function') {
    setTimeout(() => onCreateDialogComplete(id));
  }
  store.dispatch({
    type: ActionTypes.CREATE_DIALOG,
    payload: { id, content: fixedContent },
  });
};

export const updateDialogBase: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_DIALOG,
    payload: { id, content },
  });
};

export const removeAllRelatedFiles: ActionCreator = async (store, id) => {
  removeDialogBase(store, id);
  //remove dialog should remove all locales lu and lg files
  const { luFiles, lgFiles } = store.getState();
  const luIds = luFiles.filter(file => getBaseName(file.id) === id);
  const lgIds = lgFiles.filter(file => getBaseName(file.id) === id);
  luIds.forEach(({ id }) => removeLuFile(store, id));
  lgIds.forEach(({ id }) => removeLgFile(store, id));

  navTo(store, 'Main');
};

export const createAllRelatedFiles: ActionCreator = async (
  store,
  dialog: FileResource,
  lus?: FileResource[],
  lgs?: FileResource[]
) => {
  createDialogBase(store, dialog);
  const locale = store.getState().locale;
  //createDialog function need to create lg, lu and dialog
  if (!lus) {
    createLuFile(store, { id: `${dialog.id}.${locale}`, content: '' });
  } else {
    lus.forEach(lu => createLuFile(store, { id: lu.id, content: lu.content }));
  }

  if (!lgs) {
    createLgFile(store, { id: `${dialog.id}.${locale}`, content: '' });
  } else {
    lgs.forEach(lg => createLgFile(store, { id: lg.id, content: lg.content }));
  }
};

export const removeDialog = undoable(
  removeAllRelatedFiles,
  (state: State, args: any[], isStackEmpty) => {
    if (isStackEmpty) return [];
    const id = args[0];
    const dialog = state.dialogs.find(dialog => dialog.id === id);
    const lus = state.luFiles
      .filter(file => getBaseName(file.id) === id)
      .map(file => {
        return { id: file.id, content: file.content };
      });
    const lgs = state.lgFiles
      .filter(file => getBaseName(file.id) === id)
      .map(file => {
        return { id: file.id, content: file.content };
      });
    return [{ id, content: dialog?.content || '' }, lus, lgs];
  },
  async (store: Store, from, to) => {
    await createAllRelatedFiles(store, ...from);
  },
  (store, from, to) => removeAllRelatedFiles(store, to[0].id)
);

export const createDialog = undoable(
  createAllRelatedFiles,
  (state: State, args: any[], isStackEmpty) => {
    if (isStackEmpty) return [];
    const id = args[0].id;
    const content = args[0].content;
    const locale = state.locale;
    const lus = [{ id: `${id}.${locale}`, content: '' }];
    const lgs = [{ id: `${id}.${locale}`, content: '' }];
    return [{ id, content }, lus, lgs];
  },
  (store: Store, from, to) => {
    removeAllRelatedFiles(store, from[0].id);
  },
  (store, from, to) => createAllRelatedFiles(store, ...to)
);

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

export const createDialogBegin: ActionCreator = ({ dispatch }, { actions }, onComplete) => {
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
