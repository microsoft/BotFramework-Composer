// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as lgUtil from '../../utils/lgUtil';
import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';
import httpClient from './../../utils/httpUtil';

export function textFromTemplates(templates) {
  let text = '';

  templates.forEach(template => {
    if (template.Name && (template.Body !== null && template.Body !== undefined)) {
      text += `# ${template.Name.trim()}`;
      if (template.Parameters && template.Parameters.length > 0) {
        text += '(' + template.Parameters.join(', ') + ')';
      }
      text += '\n';
      text += `${template.Body.trim()}`;
    }
  });

  return text;
}
/**
 *
 * @param {Name: string, ?Parameters: string[], Body: string} template
 */
export function parseLgTemplate(template) {
  const content = textFromTemplates([template]);

  if (lgUtil.parse(content).length !== 1) {
    throw new Error('Not a single template');
  }
}

export const updateLgFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await httpClient.put(`/projects/opened/lgFiles/${id}`, { id, content });
    dispatch({
      type: ActionTypes.UPDATE_LG_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
};

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
  return await updateLgFile(store, { id: file.id, content: newContent });
};

export const createLgTemplate: ActionCreator = async (store, { file, template }) => {
  const newContent = lgUtil.addTemplate(file.content, template);
  return await updateLgFile(store, { id: file.id, content: newContent });
};

export const removeLgTemplate: ActionCreator = async (store, { file, templateName }) => {
  const newContent = lgUtil.removeTemplate(file.content, templateName);
  return await updateLgFile(store, { id: file.id, content: newContent });
};
