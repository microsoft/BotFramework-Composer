// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import { ExternalUpdate, UpdateScope, UpdateAction } from '@bfc/shared';

import { ActionTypes } from '../../constants';
import httpClient from '../../utils/httpUtil';
import * as lgUtil from '../../utils/lgUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State } from '../types';

import { recordExternalUpdate } from './shell';

export const updateLgFile: ActionCreator = async (store, { id, content }, externalUpdate?: ExternalUpdate) => {
  const { dispatch } = store;
  try {
    const response = await httpClient.put(`/projects/opened/lgFiles/${id}`, { id, content });
    dispatch({
      type: ActionTypes.UPDATE_LG_SUCCESS,
      payload: { response },
    });
    if (externalUpdate) recordExternalUpdate(store, externalUpdate);
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const undoableUpdateLgFile = undoable(
  updateLgFile,
  (state: State, args: any[], isEmpty) => {
    const externalUpdate = {
      scope: UpdateScope.LgFile,
      action: UpdateAction.UndoRedo,
    };
    if (isEmpty) {
      const id = args[0].id;
      const content = clonedeep(state.lgFiles.find(lgFile => lgFile.id === id)?.content);
      return [{ id, content }, externalUpdate];
    } else {
      return [{ ...args[0] }, externalUpdate];
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
