/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import axios from 'axios';

import * as lgUtil from '../../utils/lgUtil';
import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants';

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

// update & remove template & create if not exist
export function updateTemplateInContent({ content, templateName, template }) {
  const oldTemplates = lgUtil.parse(content);
  if (Array.isArray(oldTemplates) === false) throw new Error('origin lg file is not valid');

  const originalTemplate = oldTemplates.find(x => x.Name === templateName);
  let newContent = content.replace(/\s+$/, '');

  if (originalTemplate === undefined) {
    newContent = `${content}${content ? '\n\n' : ''}${textFromTemplates([template])}\n`;
  } else {
    const startLineNumber = originalTemplate.ParseTree._start.line;
    const endLineNumber = originalTemplate.ParseTree._stop && originalTemplate.ParseTree._stop.line;

    const lines = content.split('\n');
    const contentBefore = lines.slice(0, startLineNumber - 1).join('\n');
    const contentAfter = lines.slice(endLineNumber || lines.length).join('\n');
    const newTemplateContent = textFromTemplates([template]);

    newContent = [contentBefore, newTemplateContent, contentAfter].join('\n');
  }

  return newContent;
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

/**
 *
 * @param string, content
 */
export function checkLgContent(content) {
  // check lg content, make up error message

  const diagnostics = lgUtil.check(content);
  if (lgUtil.isValid(diagnostics) === false) {
    const errorMsg = lgUtil.combineMessage(diagnostics);
    throw new Error(errorMsg);
  }
}

export const updateLgFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/lgFiles/${id}`, { id, content });
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
    const response = await axios.post(`${BASEURL}/projects/opened/lgFiles`, { id, content });
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
    const response = await axios.delete(`${BASEURL}/projects/opened/lgFiles/${id}`);
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
  parseLgTemplate(template);
  const newContent = updateTemplateInContent({ content: file.content, templateName, template });
  return await updateLgFile(store, { id: file.id, content: newContent });
};

export const createLgTemplate: ActionCreator = async (store, { file, template, position }) => {
  parseLgTemplate(template);

  let content = file.content;
  if (position === 0) {
    content = textFromTemplates([template]) + '\n\n' + content;
  } else {
    content = content.replace(/\s+$/, '') + '\n\n' + textFromTemplates([template]) + '\n';
  }

  checkLgContent(content);
  return await updateLgFile(store, { id: file.id, content });
};

export const removeLgTemplate: ActionCreator = async (store, { file, templateName }) => {
  const newContent = updateTemplateInContent({ content: file.content, templateName, template: {} });
  checkLgContent(newContent);

  return await updateLgFile(store, { id: file.id, content: newContent });
};
