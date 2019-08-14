import { useEffect, useContext, useRef, useMemo } from 'react';
import { debounce, isEqual, get } from 'lodash';
import { navigate } from '@reach/router';

import { parseLgTemplate, checkLgContent, updateTemplateInContent } from '../src/store/action/lg';

import { isExpression } from './utils';
import * as lgUtil from './utils/lgUtil';
import { StoreContext } from './store';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { BASEPATH } from './constants';
import { resolveToBasePath } from './utils/fileUtil';
import { getFocusPath } from './utils/navigation';
import { DialogInfo, LgFile, LuFile, BotSchemas } from './store/types';

// this is the api interface provided by shell to extensions this is the single
// place handles all incoming request from extensions, VisualDesigner or
// FormEditor this is where all side effects (like directly calling api of
// extensions) happened

export interface ShellData {
  data: any;
  dialogs: DialogInfo[];
  focusPath: string;
  schemas: BotSchemas;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  currentDialog?: DialogInfo;
  dialogId: string;
  focusedEvent: string;
  focusedSteps: string[];
}

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

const shellNavigator = (shellPage: string, opts: { id?: string } = {}) => {
  switch (shellPage) {
    case 'lu':
      navigate(resolveToBasePath(BASEPATH, `/language-understanding/${opts.id}`));
      return;
    default:
      return;
  }
};

export function ShellApi() {
  const { state, actions } = useContext(StoreContext);
  const { dialogs, schemas, lgFiles, luFiles, designPageLocation, focusPath, breadcrumb } = state;
  const updateDialog = useDebouncedFunc(actions.updateDialog);
  const updateLuFile = actions.updateLuFile; //if debounced, error can't pass to form
  const updateLgFile = useDebouncedFunc(actions.updateLgFile);
  const updateLgTemplate = useDebouncedFunc(actions.updateLgTemplate);
  const createLuFile = actions.createLuFile;
  const createLgFile = actions.createLgFile;

  const { dialogId, focusedEvent, focusedSteps } = designPageLocation;

  const { LG, LU } = FileTargetTypes;
  const { CREATE, UPDATE } = FileChangeTypes;

  useEffect(() => {
    apiClient.connect();

    // @ts-ignore
    apiClient.registerApi('getState', (_, event) => getState(event.source.name));
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('updateLuFile', ({ id, content }, event) => fileHandler(LU, UPDATE, { id, content }, event));
    apiClient.registerApi('updateLgFile', ({ id, content }, event) => fileHandler(LG, UPDATE, { id, content }, event));
    apiClient.registerApi('createLuFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('createLgFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('updateLgTemplate', updateLgTemplateHandler);
    apiClient.registerApi('getLgTemplates', ({ id }, event) => getLgTemplates({ id }, event));
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('onFocusEvent', focusEvent);
    apiClient.registerApi('onFocusSteps', focusSteps);
    apiClient.registerApi('shellNavigate', ({ shellPage, opts }) => shellNavigator(shellPage, opts));
    apiClient.registerApi('isExpression', ({ expression }) => isExpression(expression));
    apiClient.registerApi('createDialog', () => {
      return new Promise(resolve => {
        actions.createDialogBegin((newDialog: string | null) => {
          resolve(newDialog);
        });
      });
    });

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
      apiClient.apiCall('reset', getState(VISUAL_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, focusPath, focusedEvent, focusedSteps]);

  useEffect(() => {
    if (window.frames[FORM_EDITOR]) {
      const editorWindow = window.frames[FORM_EDITOR];
      apiClient.apiCall('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, focusPath, focusedEvent, focusedSteps]);

  useEffect(() => {
    const schemaError = get(schemas, 'diagnostics', []);
    if (schemaError.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = schemaError.join('\n');
      OpenAlertModal(title, subTitle, { style: DialogStyle.Console });
    }
  }, [schemas]);

  // api to return the data should be showed in this window
  function getData(sourceWindow?: string) {
    if (sourceWindow === VISUAL_EDITOR && dialogId !== '') {
      return getDialogData(dialogsMap, dialogId);
    } else if (sourceWindow === FORM_EDITOR && focusPath !== '') {
      return getDialogData(dialogsMap, dialogId, getFocusPath(focusedEvent, focusedSteps[0]));
    }

    return '';
  }

  function getState(sourceWindow?: string): ShellData {
    const currentDialog = dialogs.find(d => d.id === dialogId);

    return {
      data: getData(sourceWindow),
      dialogs,
      focusPath,
      schemas,
      lgFiles,
      luFiles,
      currentDialog,
      dialogId,
      focusedEvent,
      focusedSteps,
    };
  }

  // persist value change
  function handleValueChange(newData, event) {
    let dataPath = '';
    if (event.source.name === FORM_EDITOR) {
      dataPath = getFocusPath(focusedEvent, focusedSteps[0]);
    }

    const updatedDialog = setDialogData(dialogsMap, dialogId, dataPath, newData);
    const payload = {
      id: dialogId,
      content: updatedDialog,
    };
    dialogsMap[dialogId] = updatedDialog;
    updateDialog(payload);

    //make sure focusPath always valid
    const data = getDialogData(dialogsMap, dialogId, getFocusPath(focusedEvent, focusedSteps[0]));
    if (typeof data === 'undefined') {
      actions.navTo(dialogId);
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

  /**
   *
   * @param {
   * id: string,
   * templateName: string,
   * template: { Name: string, ?Parameters: string[], Body: string }
   * }
   * when templateName exit in current file, will do update
   * when templateName do not exit in current file, will do create
   * when template is {}, will do remove
   *
   * @param {*} event
   */
  async function updateLgTemplateHandler({ id, templateName, template }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);

    parseLgTemplate(template);

    const content = updateTemplateInContent({ content: file.content, templateName, template });
    checkLgContent(content);

    await updateLgTemplate({
      file,
      templateName,
      template,
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
    const cleanedData = sanitizeDialogData(dialogsMap[dialogId]);
    if (!isEqual(dialogsMap[dialogId], cleanedData)) {
      const payload = {
        id: dialogId,
        content: cleanedData,
      };
      updateDialog(payload);
    }
    flushUpdates();
  }

  function navTo({ path }) {
    cleanData();
    actions.navTo(path, breadcrumb);
  }

  function focusEvent({ subPath }) {
    cleanData();
    actions.focusEvent(subPath);
  }

  function focusSteps({ subPaths = [] }) {
    cleanData();
    actions.focusSteps(subPaths);
  }

  return null;
}
