// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import { QnAFile } from '@bfc/shared';

import qnaWorker from '../parsers/qnaWorker';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import { ActionTypes } from '../../constants';

export const updateQnaFile: ActionCreator = async (store, { id, projectId, content }) => {
  const qnaFile = (await qnaWorker.parse(id, content)) as QnAFile;
  store.dispatch({
    type: ActionTypes.UPDATE_QNA,
    payload: { id, projectId, content, qnaFile },
  });
};

export const removeQnAFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_QNA,
    payload: { id },
  });
};

export const createQnAFile: ActionCreator = async (store, { id, content }) => {
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

export const updateQnAContent: ActionCreator = async (store, { projectId, file, content }) => {
  return await undoableUpdateQnaFile(store, { id: file.id, projectId, content });
};
