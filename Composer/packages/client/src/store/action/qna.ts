// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import { QnAFile } from '@bfc/shared';

import * as qnaUtil from '../../utils/qnaUtil';
import qnaWorker from '../parsers/qnaWorker';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import { Text } from '../../constants';
import httpClient from '../../utils/httpUtil';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';

import { ActionTypes } from './../../constants/index';

export const updateQnAFile: ActionCreator = async (store, { id, projectId, content }) => {
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

export const undoableUpdateQnAFile = undoable(
  updateQnAFile,
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
  async (store: Store, from, to) => updateQnAFile(store, ...to),
  async (store: Store, from, to) => updateQnAFile(store, ...to)
);

export const updateQnAContent: ActionCreator = async (store, { projectId, file, content }) => {
  return await undoableUpdateQnAFile(store, { id: file.id, projectId, content });
};

export const publishQna: ActionCreator = async ({ dispatch, getState }, subscriptKey, projectId) => {
  try {
    const { dialogs, qnaFiles } = getState();
    const referred = qnaUtil.checkLuisPublish(qnaFiles, dialogs);
    //TODO crosstrain should add locale
    const response = await httpClient.post(`/projects/${projectId}/qnaFiles/publish`, {
      subscriptKey,
      projectId,
      qnaFiles: referred.map((file) => file.id),
    });
    qnaFileStatusStorage.publishAll(getState().projectId);
    dispatch({
      type: ActionTypes.PUBLISH_QNA_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_QNA_FAILED,
      payload: { title: Text.LUISDEPLOYFAILURE, message: err.response?.data?.message || err.message },
    });
  }
};
