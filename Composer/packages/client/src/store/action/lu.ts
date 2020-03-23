// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import * as luUtil from '../../utils/luUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State } from '../types';
import luFileStatusStorage from '../../utils/luFileStatusStorage';

import httpClient from './../../utils/httpUtil';
import { ActionTypes } from './../../constants/index';
import { setError } from './error';
//remove editor's debounce and add it to action
export const debouncedUpdateLu = debounce(async (store, id, projectId, content, lastModified) => {
  try {
    const response = await httpClient.put(`/projects/${projectId}/luFiles/${id}`, {
      id,
      projectId,
      content,
      lastModified,
    });
    store.dispatch({
      type: ActionTypes.UPDATE_TIMESTAMP,
      payload: {
        id: id,
        type: 'lu',
        lastModified: response.data.lastModified,
      },
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE LU ERROR',
    });
  }
}, 500);

export const updateLuFile: ActionCreator = async (store, { id, projectId, content }) => {
  const file = store.getState().lgFiles.find(l => l.id === id);
  if (file) {
    luFileStatusStorage.updateFile(store.getState().botName, id);
    store.dispatch({ type: ActionTypes.UPDATE_LU_SUCCESS, payload: { id, content } });
    debouncedUpdateLu(store, id, projectId, content, file.lastModified);
  }
};

export const undoableUpdateLuFile = undoable(
  updateLuFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const projectId = args[0].projectId;
      const content = clonedeep(state.luFiles.find(luFile => luFile.id === id)?.content);
      return [{ id, projectId, content }];
    } else {
      return args;
    }
  },
  updateLuFile,
  updateLuFile
);

export const createLuFile: ActionCreator = async ({ dispatch, getState }, { id, projectId, content }) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/luFiles`, { id, projectId, content });
    luFileStatusStorage.createFile(getState().botName, id);
    dispatch({
      type: ActionTypes.CREATE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LU_FAILURE,
      payload: null,
      // TODO, createReducer do not take this error now
      // we need to put it in payload
      error: err,
    });
  }
};

export const removeLuFile: ActionCreator = async ({ dispatch, getState }, { id, projectId }) => {
  try {
    const response = await httpClient.delete(`/projects/${projectId}/luFiles/${id}`);
    luFileStatusStorage.removeFile(getState().botName, id);
    dispatch({
      type: ActionTypes.REMOVE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const updateLuIntent: ActionCreator = async (store, { projectId, file, intentName, intent }) => {
  const newContent = luUtil.updateIntent(file.content, intentName, intent);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const createLuIntent: ActionCreator = async (store, { projectId, file, intent }) => {
  const newContent = luUtil.addIntent(file.content, intent);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const removeLuIntent: ActionCreator = async (store, { projectId, file, intentName }) => {
  const newContent = luUtil.removeIntent(file.content, intentName);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const publishLuis: ActionCreator = async ({ dispatch, getState }, authoringKey, projectId) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/luFiles/publish`, { authoringKey, projectId });
    luFileStatusStorage.publishAll(getState().botName);
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};
