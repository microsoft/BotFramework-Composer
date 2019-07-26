import { useEffect, useContext, useRef, useMemo } from 'react';
import { debounce, isEqual, get } from 'lodash';
import { navigate } from '@reach/router';

import { parseLgTemplate, checkLgContent, replaceTemplateInContent, textFromTemplates } from '../src/store/action/lg';

import { isExpression } from './utils';
import * as lgUtil from './utils/lgUtil';
import { Store } from './store/index';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { BASEPATH } from './constants';
import { resolveToBasePath } from './utils/fileUtil';

// this is the api interface provided by shell to extensions
// this is the single place handles all incoming request from extensions, VisualDesigner or FormEditor
// this is where all side effects (like directly calling api of extensions) happened

const apiClient = new ApiClient();

const VISUAL_EDITOR = 'VisualEditor';
const FORM_EDITOR = 'FormEditor';

const isEventSourceValid = event => {
  const sourceWindowName = event.source.name;
  return [VISUAL_EDITOR, FORM_EDITOR].indexOf(sourceWindowName) !== -1;
};

const useDebouncedFunc = (fn, delay = 750) => useRef(debounce(fn, delay)).current;

const FileChangeTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  REMOVE: 'remove',
  VALIDATE: 'validate',
};

const FileTargetTypes = {
  LU: 'lu',
  LG: 'lg',
};

const shellNavigator = (shellPage, opts = {}) => {
  switch (shellPage) {
    case 'lu':
      navigate(resolveToBasePath(BASEPATH, `/language-understanding/${opts.id}`));
      return;
    default:
      return;
  }
};

export function ShellApi() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, focusPath, schemas, lgFiles, luFiles } = state;
  const updateDialog = useDebouncedFunc(actions.updateDialog);
  const updateLuFile = useDebouncedFunc(actions.updateLuFile);
  const updateLgFile = useDebouncedFunc(actions.updateLgFile);
  const createLgTemplate = useDebouncedFunc(actions.createLgTemplate);
  const updateLgTemplate = useDebouncedFunc(actions.updateLgTemplate);
  const removeLgTemplate = useDebouncedFunc(actions.removeLgTemplate);
  const createLuFile = actions.createLuFile;
  const createLgFile = actions.createLgFile;

  const { LG, LU } = FileTargetTypes;
  const { CREATE, UPDATE } = FileChangeTypes;

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getState', (_, event) => getState(event.source.name));
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('updateLuFile', ({ id, content }, event) => fileHandler(LU, UPDATE, { id, content }, event));
    apiClient.registerApi('updateLgFile', ({ id, content }, event) => fileHandler(LG, UPDATE, { id, content }, event));
    apiClient.registerApi('createLuFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('createLgFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('createLgTemplate', createLgTemplateHandler);
    apiClient.registerApi('updateLgTemplate', updateLgTemplateHandler);
    apiClient.registerApi('removeLgTemplate', removeLgTemplateHandler);
    apiClient.registerApi('validateLgTemplate', ({ Name, Body }) => parseLgTemplate({ Name, Body }));
    apiClient.registerApi('getLgTemplates', ({ id }, event) => getLgTemplates({ id }, event));
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('navDown', navDown);
    apiClient.registerApi('focusTo', focusTo);
    apiClient.registerApi('shellNavigate', ({ shellPage, opts }) => shellNavigator(shellPage, opts));
    apiClient.registerApi('isExpression', str => isExpression(str));

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  useEffect(() => {
    if (window.frames[VISUAL_EDITOR]) {
      const editorWindow = window.frames[VISUAL_EDITOR];
      apiClient.apiCallAt('reset', getState(VISUAL_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, navPath, focusPath]);

  useEffect(() => {
    if (window.frames[FORM_EDITOR]) {
      const editorWindow = window.frames[FORM_EDITOR];
      apiClient.apiCallAt('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, navPath, focusPath]);

  useEffect(() => {
    const schemaError = get(schemas, 'diagnostics', []);
    if (schemaError.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = schemaError.join('\n');
      OpenAlertModal(title, subTitle, {
        style: DialogStyle.Console,
      });
    }
  }, [schemas]);

  // api to return the data should be showed in this window
  function getData(sourceWindow) {
    if (sourceWindow === VISUAL_EDITOR && navPath !== '') {
      return getDialogData(dialogsMap, navPath);
    } else if (sourceWindow === FORM_EDITOR && focusPath !== '') {
      return getDialogData(dialogsMap, focusPath);
    }

    return '';
  }

  function getState(sourceWindow) {
    const [currentDialogId] = navPath.split('#');
    const currentDialog = dialogs.find(d => d.id === currentDialogId);

    return {
      data: getData(sourceWindow),
      dialogs,
      navPath,
      focusPath,
      schemas,
      lgFiles,
      luFiles,
      currentDialog,
    };
  }

  // persist value change
  function handleValueChange(newData, event) {
    const sourceWindowName = event.source.name;
    let path = '';
    switch (sourceWindowName) {
      case VISUAL_EDITOR:
        path = navPath;
        break;
      case FORM_EDITOR:
        path = focusPath;
        break;
      default:
        path = '';
        break;
    }

    if (path !== '') {
      const updatedDialog = setDialogData(dialogsMap, path, newData);
      const dialogId = path.split('#')[0];
      const payload = { id: dialogId, content: updatedDialog };
      dialogsMap[dialogId] = updatedDialog;
      updateDialog(payload);
    }

    //make sure focusPath always valid
    const data = getDialogData(dialogsMap, focusPath);
    if (typeof data === 'undefined') {
      actions.focusTo(navPath);
    }

    return true;
  }

  function getLgTemplates({ id }, event) {
    if (isEventSourceValid(event) === false) return false;

    if (id === undefined) throw new Error('must have a file id');
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);

    const templates = lgUtil.parse(file.content);
    const lines = file.content.split('\n');

    return templates.map(t => {
      const [start, end] = getTemplateBodyRange(t);
      const body = lines.slice(start - 1, end).join('\n');

      return { Name: t.Name, Parameters: t.Parameters, Body: body };
    });
  }

  function getTemplateBodyRange(template) {
    const startLineNumber = template.ParseTree._start.line + 1;
    const endLineNumber = template.ParseTree._stop.line;
    return [startLineNumber, endLineNumber];
  }

  async function createLgTemplateHandler({ id, template, position }, event) {
    if (isEventSourceValid(event) === false) return false;

    parseLgTemplate(template);
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    const appendContent = textFromTemplates([template]);
    const content = file.content + '\n' + appendContent;
    checkLgContent(content);

    await createLgTemplate({
      file,
      template,
      position: position === 0 ? 0 : -1,
    });
  }

  async function updateLgTemplateHandler({ id, templateName, template }, event) {
    if (isEventSourceValid(event) === false) return false;

    parseLgTemplate(template);
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);

    // TODO: form editor should call createLgTemplate
    // remove try catch

    try {
      const content = replaceTemplateInContent({ content: file.content, templateName, template });
      checkLgContent(content);
    } catch (error) {
      await createLgTemplateHandler({ id, template }, event);
      return;
    }

    await updateLgTemplate({
      file,
      templateName,
      template,
    });
  }

  async function removeLgTemplateHandler({ id, templateName }, event) {
    if (isEventSourceValid(event) === false) return false;

    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    await removeLgTemplate({
      file,
      templateName,
    });
  }

  async function fileHandler(fileTargetType, fileChangeType, { id, content }, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id,
      content,
    };

    switch ([fileTargetType, fileChangeType].join(',')) {
      case [LU, UPDATE].join(','):
        return await updateLuFile(payload);

      case [LG, UPDATE].join(','):
        return await updateLgFile(payload);

      case [LU, CREATE].join(','):
        return await createLuFile(payload);

      case [LG, CREATE].join(','):
        return await createLgFile(payload);
      default:
        throw new Error(`unsupported method ${fileTargetType} - ${fileChangeType}`);
    }
  }

  function flushUpdates() {
    if (updateDialog.flush) {
      updateDialog.flush();
    }
  }

  function cleanData() {
    const dialogId = navPath.split('#')[0];
    const cleanedData = sanitizeDialogData(dialogsMap[dialogId]);
    if (!isEqual(dialogsMap[dialogId], cleanedData)) {
      const payload = { id: dialogId, content: cleanedData };
      updateDialog(payload);
    }
    flushUpdates();
  }

  function navTo({ path, rest }) {
    cleanData();
    actions.navTo(path, rest);
  }

  function navDown({ subPath }) {
    cleanData();
    actions.navDown(subPath);
  }

  function focusTo({ subPath }, event) {
    cleanData();
    let path = navPath;
    if (event.source.name === FORM_EDITOR) {
      path = focusPath;
    }
    actions.focusTo(path + subPath);
  }

  return null;
}
