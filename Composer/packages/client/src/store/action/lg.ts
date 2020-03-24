// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';

import { ActionTypes } from '../../constants';
import * as lgUtil from '../../utils/lgUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State } from '../types';

import { FileChangeType } from './../middlewares/persistence/types';

export const updateLgFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.UPDATE_LG_SUCCESS,
    payload: {
      id,
      content,
      changeType: FileChangeType.UPDATE,
      name: `${id}.lg`,
    },
  });
};

export const createLgFile: ActionCreator = async (store, { id, content }) => {
  const lgFiles = store.getState().lgFiles;
  const lgFile = lgFiles.find(lg => lg.id === id);
  if (lgFile) {
    throw new Error(`${id} lg file already exist`);
  }
  // slot with common.lg import
  let lgInitialContent = '';
  const lgCommonFile = lgFiles.find(({ id }) => id === 'common');
  if (lgCommonFile) {
    lgInitialContent = `[import](common.lg)`;
  }
  store.dispatch({
    type: ActionTypes.CREATE_LG_SUCCCESS,
    payload: {
      id,
      content: [lgInitialContent, content].join('\n'),
      changeType: FileChangeType.CREATE,
      name: `${id}.lg`,
    },
  });
};

export const removeLgFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_LG_SUCCCESS,
    payload: {
      id,
      changeType: FileChangeType.DELETE,
      name: `${id}.lg`,
    },
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
  updateLgFile,
  updateLgFile
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
