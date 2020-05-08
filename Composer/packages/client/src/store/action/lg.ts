// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import { LgFile } from '@bfc/shared';

import { ActionTypes } from '../../constants';
import * as lgUtil from '../../utils/lgUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import LgWorker from '../parsers/lgWorker';

export const updateLgFile: ActionCreator = async (store, { id, content }) => {
  const result = (await LgWorker.parse(id, content, store.getState().lgFiles)) as LgFile;
  store.dispatch({
    type: ActionTypes.UPDATE_LG,
    payload: { ...result },
  });
};

export const createLgFile: ActionCreator = (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.CREATE_LG,
    payload: { id, content },
  });
};

export const removeLgFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_LG,
    payload: { id },
  });
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
  async (store: Store, from, to) => updateLgFile(store, ...to),
  async (store: Store, from, to) => updateLgFile(store, ...to)
);

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
