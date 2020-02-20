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
export const debouncedUpdateLg = debounce(async (store, id, projectId, content) => {
  try {
    await httpClient.put(`/projects/${projectId}/lgFiles/${id}`, { id, projectId, content });
  } catch (err) {
    setError(store, {
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE LG ERROR',
    });
    //if update lg error, do a full refresh.
    fetchProject(store);
  }
}, 500);

export const updateLgFile: ActionCreator = async (store, { id, projectId, content }) => {
  store.dispatch({ type: ActionTypes.UPDATE_LG_SUCCESS, payload: { id, projectId, content } });
  debouncedUpdateLg(store, id, projectId, content);
};

export const undoableUpdateLgFile = undoable(
  updateLgFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const content = clonedeep(state.lgFiles.find(lgFile => lgFile.id === id)?.content);
      return [{ id, content, projectId: state.projectId }];
    } else {
      return args;
    }
  },
  updateLgFile,
  updateLgFile
);

export const createLgFile: ActionCreator = async ({ dispatch }, { id, projectId, content }) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/lgFiles`, { id, content });
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

export const removeLgFile: ActionCreator = async ({ dispatch }, { id, projectId }) => {
  try {
    const response = await httpClient.delete(`/projects/${projectId}/lgFiles/${id}`);
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

export const updateLgTemplate: ActionCreator = async (store, { file, projectId, templateName, template }) => {
  const newContent = lgUtil.updateTemplate(file.content, templateName, template);
  return await undoableUpdateLgFile(store, { id: file.id, projectId, content: newContent });
};

export const createLgTemplate: ActionCreator = async (store, { file, projectId, template }) => {
  const newContent = lgUtil.addTemplate(file.content, template);
  return await undoableUpdateLgFile(store, { id: file.id, projectId, content: newContent });
};

export const removeLgTemplate: ActionCreator = async (store, { file, projectId, templateName }) => {
  const newContent = lgUtil.removeTemplate(file.content, templateName);
  return await undoableUpdateLgFile(store, { id: file.id, projectId, content: newContent });
};

export const removeLgTemplates: ActionCreator = async (store, { file, projectId, templateNames }) => {
  const newContent = lgUtil.removeTemplates(file.content, templateNames);
  return await undoableUpdateLgFile(store, { id: file.id, projectId, content: newContent });
};

export const copyLgTemplate: ActionCreator = async (store, { file, fromTemplateName, toTemplateName, projectId }) => {
  const newContent = lgUtil.copyTemplate(file.content, fromTemplateName, toTemplateName);
  return await undoableUpdateLgFile(store, { id: file.id, content: newContent, projectId });
};
