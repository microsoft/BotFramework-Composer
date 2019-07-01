import axios from 'axios';
import { LGParser } from 'botbuilder-lg';

import { BASEURL, ActionTypes } from './../../constants/index';

const templateValidate = ({ Name, Body }) => {
  const text = ['#', Name, '\n', Body].join('');
  return LGParser.TryParse(text);
};

const templatesFromText = content => {
  const res = LGParser.TryParse(content);
  return res.isValid && res.templates;
};

const textFromTemplates = templates => {
  let text = '';

  templates.forEach(template => {
    if (template.Name && (template.Body !== null && template.Body !== undefined)) {
      text += `# ${template.Name.trim()}` + '\n';
      text += `${template.Body.trim()}` + '\n\n';
    }
  });

  return text;
};

export async function updateLgFile(dispatch, { id, content }) {
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
  // validate template
  const validateResult = templateValidate(template);
  if (validateResult.isValid === false) {
    return new Error(validateResult.error.Message);
  }
  const oldTemplates = templatesFromText(file.content);
  if (Array.isArray(oldTemplates) === false) return new Error('origin lg file is not valid');

  const newTemplates = oldTemplates.map(item => {
    if (item.Name === templateName) {
      return {
        Name: template.Name,
        Body: template.Body,
      };
    }
    return item;
  });

  const content = textFromTemplates(newTemplates);
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
  // validate template
  const validateResult = templateValidate(template);
  if (validateResult.isValid === false) {
    return new Error(validateResult.error.Message);
  }

  // ToDo, here got an alternative implementation
  // ```file.content += textFromTemplates(template)```
  // but maybe cannot handle comments correctly. not sure which is better

  const oldTemplates = templatesFromText(file.content);
  if (Array.isArray(oldTemplates) === false) return new Error('origin lg file is not valid');

  const newTemplates = [...oldTemplates];
  if (position === 0) {
    newTemplates.unshift(template);
  } else {
    newTemplates.push(template);
  }
  const content = textFromTemplates(newTemplates);
  return await updateLgFile(dispatch, { id: file.id, content });
}

/**
 *
 * @param {*} dispatch
 * @param {*} file lg file take this update
 * @param {*} templateName name of template to delete
 */
export async function removeLgTemplate(dispatch, { file, templateName }) {
  const oldTemplates = templatesFromText(file.content);
  if (Array.isArray(oldTemplates) === false) return new Error('origin lg file is not valid');

  const newTemplates = oldTemplates.filter(item => {
    return item.Name !== templateName;
  });

  const content = textFromTemplates(newTemplates);

  return await updateLgFile(dispatch, { id: file.id, content });
}
