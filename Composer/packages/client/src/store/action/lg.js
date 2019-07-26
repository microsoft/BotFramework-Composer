import axios from 'axios';

import * as lgUtil from '../../utils/lgUtil';

import { BASEURL, ActionTypes } from './../../constants/index';

const textFromTemplates = templates => {
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
};

const insertTemplateIntoContent = ({ file, templateName, template }) => {
  const oldTemplates = lgUtil.parse(file.content);
  if (Array.isArray(oldTemplates) === false) throw new Error('origin lg file is not valid');

  const orignialTemplate = templateName ? oldTemplates.find(x => x.Name === templateName) : undefined;
  let content = file.content.trimEnd();

  // create lg template
  if (orignialTemplate === undefined) {
    content = `${content}${content ? '\n\n' : ''}${textFromTemplates([template])}\n`;

    // update lg template
  } else {
    const startLineNumber = orignialTemplate.ParseTree._start.line;
    const endLineNumber = orignialTemplate.ParseTree._stop.line;

    const lines = content.split('\n');
    const contentBefore = lines.slice(0, startLineNumber - 1).join('\n');
    const contentAfter = lines.slice(endLineNumber).join('\n');
    const newTemplateContent = textFromTemplates([template]);

    content = [contentBefore, newTemplateContent, contentAfter].join('\n');
  }

  return content;
};

/**
 *
 * @param {Name, Body} template
 */
export function validateLgTemplate({ file, templateName, template }) {
  const content = insertTemplateIntoContent({ file, templateName, template });
  validateLgContent(content);

  // create lg template, should add a single template.
  if (templateName === undefined) {
    if (lgUtil.parse(content).length === lgUtil.parse(file.content).length) {
      throw new Error('Not a single template');
    }

    // update lg template, should no add template.
  } else {
    if (lgUtil.parse(content).length - lgUtil.parse(file.content).length === 1) {
      throw new Error('Not a single template');
    }
  }
}

/**
 *
 * @param string, content
 */
export function validateLgContent(content) {
  // validate template, make up error message

  const diagnostics = lgUtil.check(content);
  if (lgUtil.isValid(diagnostics) === false) {
    const errorMsg = lgUtil.combineMessage(diagnostics);
    throw new Error(errorMsg);
  }
}

export async function updateLgFile(dispatch, { id, content }) {
  validateLgContent(content);
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
}

export async function createLgFile(dispatch, { id, content }) {
  validateLgContent(content);
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
}

export async function removeLgFile(dispatch, { id }) {
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
}

/**
 *
 * @param {*} dispatch
 * @param {*} file lg file take this update
 * @param {*} templateName name of template to update
 * @param {*} template updated template, expected {Name, Body}
 */
export async function updateLgTemplate(dispatch, { file, templateName, template }) {
  validateLgTemplate({ file, templateName, template });
  const content = insertTemplateIntoContent({ file, templateName, template });

  return await updateLgFile(dispatch, { id: file.id, content });
}

/**
 *
 * @param {*} dispatch
 * @param {*} File lg file take this update
 * @param {*} template new template to add, expected {Name, Body}
 * @param {*} position
 *   0 insert at file start
 *  -1 insert at file end, by default
 */

export async function createLgTemplate(dispatch, { file, template, position }) {
  validateLgTemplate({ file, template });

  let content = file.content;
  if (position === 0) {
    content = textFromTemplates([template]) + '\n\n' + content;
  } else {
    content = content.trimEnd() + '\n\n' + textFromTemplates([template]) + '\n';
  }

  return await updateLgFile(dispatch, { id: file.id, content });
}

/**
 *
 * @param {*} dispatch
 * @param {*} file lg file take this update
 * @param {*} templateName name of template to delete
 */
export async function removeLgTemplate(dispatch, { file, templateName }) {
  const oldTemplates = lgUtil.parse(file.content);
  if (Array.isArray(oldTemplates) === false) throw new Error('origin lg file is not valid');

  const orignialTemplate = oldTemplates.find(x => x.Name === templateName);
  if (orignialTemplate === undefined) {
    throw new Error(`no such template ${templateName} to delete`);
  }
  const startLineNumber = orignialTemplate.ParseTree._start.line;
  const endLineNumber = orignialTemplate.ParseTree._stop.line;

  const lines = file.content.split('\n');
  const contentBefore = lines.slice(0, startLineNumber - 1).join('\n');
  const contentAfter = lines.slice(endLineNumber).join('\n');

  const content = [contentBefore, contentAfter].join('\n');

  return await updateLgFile(dispatch, { id: file.id, content });
}
