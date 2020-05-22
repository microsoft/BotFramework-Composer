// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';

import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import { ActionTypes } from '../../constants/index';

export const updateFormDialogFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_FORMDIALOG,
    payload: { id, content },
  });
};

export const removeFormDialogFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_FORMDIALOG,
    payload: { id },
  });
};

export const createFormDialogFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.CREATE_FORMDIALOG,
    payload: { id, content },
  });
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
