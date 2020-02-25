// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import * as luUtil from '../../utils/luUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State } from '../types';

import httpClient from './../../utils/httpUtil';
import { ActionTypes } from './../../constants/index';
import { fetchProject } from './project';
import { setError } from './error';
//remove editor's debounce and add it to action
export const debouncedUpdateLu = debounce(async (store, id, content) => {
  try {
    await httpClient.put(`/projects/opened/luFiles/${id}`, { id, content });
  } catch (err) {
    setError(store, {
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE LU ERROR',
    });
    //if update lu error, do a full refresh.
    fetchProject(store);
  }
}, 500);

export const updateLuFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({ type: ActionTypes.UPDATE_LU_SUCCESS, payload: { id, content } });
  debouncedUpdateLu(store, id, content);
};

export const undoableUpdateLuFile = undoable(
  updateLuFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const content = clonedeep(state.luFiles.find(luFile => luFile.id === id)?.content);
      return [{ id, content }];
    } else {
      return args;
    }
  },
  updateLuFile,
  updateLuFile
);

export const createLuFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await httpClient.post(`/projects/opened/luFiles`, { id, content });
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

export const removeLuFile: ActionCreator = async ({ dispatch }, { id }) => {
  try {
    const response = await httpClient.delete(`/projects/opened/luFiles/${id}`);
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

export const updateLuIntent: ActionCreator = async (store, { file, intentName, intent }) => {
  const newContent = luUtil.updateIntent(file.content, intentName, intent);
  return await undoableUpdateLuFile(store, { id: file.id, content: newContent });
};

export const createLuIntent: ActionCreator = async (store, { file, intent }) => {
  const newContent = luUtil.addIntent(file.content, intent);
  return await undoableUpdateLuFile(store, { id: file.id, content: newContent });
};

export const removeLuIntent: ActionCreator = async (store, { file, intentName }) => {
  const newContent = luUtil.removeIntent(file.content, intentName);
  return await undoableUpdateLuFile(store, { id: file.id, content: newContent });
};

export const publishLuis: ActionCreator = async ({ dispatch }, authoringKey) => {
  try {
    const response = await httpClient.post(`/projects/opened/luFiles/publish`, { authoringKey });
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};
