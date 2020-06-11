// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';

import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';

import { ActionTypes } from './../../constants/index';

export const updateQnaFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_QNA,
    payload: { id, content },
  });
};

export const removeQnaFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_QNA,
    payload: { id },
  });
};

export const createQnaFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.CREATE_QNA,
    payload: { id, content },
  });
};

export const undoableUpdateQnaFile = undoable(
  updateQnaFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const projectId = args[0].projectId;
      const content = clonedeep(state.qnaFiles.find((qnaFile) => qnaFile.id === id)?.content);
      return [{ id, projectId, content }];
    } else {
      return args;
    }
  },
  async (store: Store, from, to) => updateQnaFile(store, ...to),
  async (store: Store, from, to) => updateQnaFile(store, ...to)
);

export const updateQnaContent: ActionCreator = async (store, { projectId, file, content }) => {
  return await undoableUpdateQnaFile(store, { id: file.id, projectId, content });
};
