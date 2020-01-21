// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import { ActionTypes } from '../../constants';
import httpClient from '../../utils/httpUtil';
import * as lgUtil from '../../utils/lgUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State } from '../types';

import { fetchProject } from './project';
import { setError } from './error';

//remove editor's debounce and add it to action
export const debouncedUpdateLg = debounce(async (store, id, content) => {
  try {
    await httpClient.put(`/projects/opened/lgFiles/${id}`, { id, content });
  } catch (err) {
    setError(store, {
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE LG ERROR',
    });
    //if update lg error, do a full refresh.
    fetchProject(store);
  }
}, 500);

export const updateLgFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({ type: ActionTypes.UPDATE_LG_SUCCESS, payload: { id, content } });
  debouncedUpdateLg(store, id, content);
};

export const undoableUpdateLgFile = undoable(
  updateLgFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const content = clonedeep(state.lgFiles.find(lgFile => lgFile.id === id)?.content);
      return [{ id, content }];
    } else {
      return args;
    }
  },
  updateLgFile,
  updateLgFile
);

export const createLgFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await httpClient.post(`/projects/opened/lgFiles`, { id, content });
    dispatch({
      type: ActionTypes.CREATE_LG_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const removeLgFile: ActionCreator = async ({ dispatch }, { id }) => {
  try {
    const response = await httpClient.delete(`/projects/opened/lgFiles/${id}`);
    dispatch({
      type: ActionTypes.REMOVE_LG_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const updateLgTemplate: ActionCreator = async (store, { file, templateName, template }) => {
  const newContent = lgUtil.updateTemplate(file.content, templateName, template);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent });
};

export const createLgTemplate: ActionCreator = async (store, { file, template }) => {
  const newContent = lgUtil.addTemplate(file.content, template);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent });
};

export const removeLgTemplate: ActionCreator = async (store, { file, templateName }) => {
  const newContent = lgUtil.removeTemplate(file.content, templateName);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent });
};

export const removeLgTemplates: ActionCreator = async (store, { file, templateNames }) => {
  const newContent = lgUtil.removeTemplates(file.content, templateNames);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent });
};

export const copyLgTemplate: ActionCreator = async (store, { file, fromTemplateName, toTemplateName }) => {
  const newContent = lgUtil.copyTemplate(file.content, fromTemplateName, toTemplateName);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent });
};
