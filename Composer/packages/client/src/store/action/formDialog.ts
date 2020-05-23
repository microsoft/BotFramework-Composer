// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';

import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import { ActionTypes } from '../../constants/index';
import httpClient from '../../utils/httpUtil';

export const updateFormDialogFile: ActionCreator = async (store, { id, content, dialogType }) => {
  if (dialogType === 'formDialog') {
    store.dispatch({
      type: ActionTypes.UPDATE_FORMDIALOG,
      payload: { id, content },
    });
  } else {
    store.dispatch({
      type: ActionTypes.UPDATE_CMD,
      payload: { id, content },
    });
  }
};

export const copyFile: ActionCreator = async (store, { projectId, fileName, content }) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/files`, {
      name: fileName,
      content,
    });
    return response.data;
  } catch (error) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: { error } });
  }
};
export const removeFormDialogFile: ActionCreator = async (store, id, dialogType) => {
  if (dialogType === 'formDialog') {
    store.dispatch({
      type: ActionTypes.REMOVE_FORMDIALOG,
      payload: { id },
    });
  } else {
    store.dispatch({
      type: ActionTypes.REMOVE_CMD,
      payload: { id },
    });
  }
};

export const createFormDialogFile: ActionCreator = async (store, { id, content, dialogType }) => {
  if (dialogType === 'formDialog') {
    store.dispatch({
      type: ActionTypes.CREATE_FORMDIALOG,
      payload: { id, content },
    });
  } else {
    store.dispatch({
      type: ActionTypes.CREATE_CMD,
      payload: { id, content },
    });
  }
};

export const undoableUpdateFormDialogFile = undoable(
  updateFormDialogFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const projectId = args[0].projectId;
      const content = clonedeep(state.formDialogFiles.find(formDialogFile => formDialogFile.id === id)?.content);
      return [{ id, projectId, content }];
    } else {
      return args;
    }
  },
  async (store: Store, from, to) => updateFormDialogFile(store, ...to),
  async (store: Store, from, to) => updateFormDialogFile(store, ...to)
);

export const updateFormDialogContent: ActionCreator = async (store, { projectId, file, content }) => {
  return await undoableUpdateFormDialogFile(store, { id: file.id, projectId, content });
};
