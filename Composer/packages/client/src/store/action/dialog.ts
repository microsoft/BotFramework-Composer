// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import clonedeep from 'lodash/cloneDeep';
import reject from 'lodash/reject';
import { DialogInfo } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { ActionCreator, State } from '../types';
import { undoable, Pick } from '../middlewares/undo';
import luFileStatusStorage from '../../utils/luFileStatusStorage';

import { ActionTypes } from './../../constants/index';
import { navTo } from './navigation';
import { Store } from './../types';
import httpClient from './../../utils/httpUtil';
import { setError } from './error';

const pickDialog: Pick = (state: State, args: any[], isStackEmpty) => {
  const id = args[0];
  const dialog = state.dialogs.find(dialog => dialog.id === id);
  let dialogs = clonedeep(state.dialogs);
  if (!isStackEmpty) {
    dialogs = reject(dialogs, ['id', id]);
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

export const removeDialogBase: ActionCreator = async (store, id) => {
  try {
    const projectId = store.getState().projectId;
    const response = await httpClient.delete(`/projects/${projectId}/dialogs/${id}`);
    luFileStatusStorage.removeFile(store.getState().botName, id);
    store.dispatch({
      type: ActionTypes.REMOVE_DIALOG,
      payload: { response },
    });
    navTo(store, 'Main');
  } catch (err) {
    setError(store, {
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'DELETE DIALOG ERROR',
    });
  }
};

export const createDialogBase: ActionCreator = async (store, { id, content }) => {
  try {
    const projectId = store.getState().projectId;
    const response = await httpClient.post(`/projects/${projectId}/dialogs`, { id, content, projectId });
    const onCreateDialogComplete = store.getState().onCreateDialogComplete;
    if (typeof onCreateDialogComplete === 'function') {
      setTimeout(() => onCreateDialogComplete(id));
    }
    store.dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    setError(store, {
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'CREATE DIALOG ERROR',
    });
  }
};

export const removeDialog = undoable(
  removeDialogBase,
  pickDialog,
  async (store: Store, { dialogs }) => {
    const target = getDiff(store.getState().dialogs, dialogs);
    if (target) {
      await createDialogBase(store, { ...target });
    }
  },
  (store, { id }) => removeDialogBase(store, id)
);

export const createDialog = undoable(
  createDialogBase,
  pickDialog,
  async (store: Store, { dialogs }) => {
    const target = getDiff(dialogs, store.getState().dialogs);
    if (target) {
      await removeDialogBase(store, target.id);
    }
  },
  (store, { id, content }) => createDialogBase(store, { id, content })
);

export const debouncedUpdateDialog = debounce(async (store, id, projectId, content, lastModified) => {
  try {
    const response = await httpClient.put(`/projects/${projectId}/dialogs/${id}`, {
      id,
      projectId,
      content,
      lastModified,
    });
    store.dispatch({
      type: ActionTypes.UPDATE_TIMESTAMP,
      payload: {
        id: id,
        type: 'dialog',
        lastModified: response.data.lastModified,
      },
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE DIALOG ERROR',
    });
  }
}, 500);

export const updateDialogBase: ActionCreator = (store, { id, content }) => {
  const state = store.getState();
  const projectId = state.projectId;
  const dialog = state.dialogs.find(dialog => dialog.id === id);
  if (dialog) {
    store.dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: { id, projectId, content, lastModified: dialog.lastModified },
    });
    debouncedUpdateDialog(store, id, projectId, content, dialog.lastModified);
  }
};

export const updateDialog: ActionCreator = undoable(
  updateDialogBase,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = state.designPageLocation.dialogId;
      const dialog = state.dialogs.find(dialog => dialog.id === id);
      const projectId = state.projectId;
      return [{ id, projectId, content: dialog ? dialog.content : {} }];
    } else {
      return args;
    }
  },
  updateDialogBase,
  updateDialogBase
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
