// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useContext, useMemo } from 'react';
import { ShellData } from '@bfc/shared';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import { isExpression } from './utils';
import * as lgUtil from './utils/lgUtil';
import * as luUtil from './utils/luUtil';
import { updateRegExIntent } from './utils/dialogUtil';
import { StoreContext } from './store';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';
import { isAbsHosted } from './utils/envUtil';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { getFocusPath } from './utils/navigation';

// this is the api interface provided by shell to extensions this is the single
// place handles all incoming request from extensions, VisualDesigner or
// FormEditor this is where all side effects (like directly calling api of
// extensions) happened

const apiClient = new ApiClient();

const VISUAL_EDITOR = 'VisualEditor';
const FORM_EDITOR = 'FormEditor';

const isEventSourceValid = event => {
  const sourceWindowName = event.source.name;
  return [VISUAL_EDITOR, FORM_EDITOR].includes(sourceWindowName);
};

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

export const ShellApi: React.FC = () => {
  const { state, actions } = useContext(StoreContext);

  const { dialogs, schemas, lgFiles, luFiles, designPageLocation, focusPath, breadcrumb, botName, projectId } = state;
  const updateDialog = actions.updateDialog;
  const updateLuFile = actions.updateLuFile; //if debounced, error can't pass to form
  const updateLgFile = actions.updateLgFile;
  const updateLgTemplate = actions.updateLgTemplate;
  const createLuFile = actions.createLuFile;
  const createLgFile = actions.createLgFile;

  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const { LG, LU } = FileTargetTypes;
  const { CREATE, UPDATE } = FileChangeTypes;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  // api to return the data should be showed in this window
  function getData(sourceWindow?: string) {
    if (sourceWindow === VISUAL_EDITOR && dialogId !== '') {
      return getDialogData(dialogsMap, dialogId);
    } else if (sourceWindow === FORM_EDITOR && focusPath !== '') {
      return getDialogData(dialogsMap, dialogId, focused || selected || '');
    }

    return '';
  }

  function getState(sourceWindow?: string): ShellData {
    const currentDialog = dialogs.find(d => d.id === dialogId);

    if (!currentDialog) {
      return {} as ShellData;
    }

    const data = getData(sourceWindow);
    return {
      data,
      botName,
      projectId,
      dialogs,
      focusPath,
      schemas,
      lgFiles,
      luFiles,
      currentDialog,
      dialogId,
      designerId: get(data, '$designer.id'),
      focusedEvent: selected,
      focusedActions: focused ? [focused] : [],
      focusedSteps: focused ? [focused] : selected ? [selected] : [],
      focusedTab: promptTab,
      clipboardActions: state.clipboardActions,
      hosted: !!isAbsHosted(),
    };
  }

  // persist value change
  function handleValueChange({ newData, updatePath }, event) {
    let dataPath = '';
    if (event.source.name === FORM_EDITOR) {
      dataPath = updatePath || focused || '';
    }

    const updatedDialog = setDialogData(dialogsMap, dialogId, dataPath, newData);
    const payload = {
      id: dialogId,
      content: updatedDialog,
      projectId,
    };
    dialogsMap[dialogId] = updatedDialog;
    updateDialog(payload);

    //make sure focusPath always valid
    const data = getDialogData(dialogsMap, dialogId, getFocusPath(selected, focused));
    if (typeof data === 'undefined') {
      actions.navTo(dialogId);
    }

    return true;
  }

  function getLgTemplates({ id }, event) {
    if (isEventSourceValid(event) === false) return false;
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = focusPath.split('#').shift() || id;
    const file = lgFiles.find(file => file.id === focusedDialogId);
    if (!file) throw new Error(`lg file ${id} not found`);
    return file.templates;
  }

  /**
   *
   * @param {
   * id: string,
   * templateName: string,
   * template: { name: string, ?parameters: string[], body: string }
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

    const projectId = state.projectId;

    lgUtil.checkSingleLgTemplate(template);

    await updateLgTemplate({
      file,
      projectId,
      templateName,
      template,
    });
  }

  function copyLgTemplateHandler({ id, fromTemplateName, toTemplateName }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!fromTemplateName || !toTemplateName) throw new Error(`templateName is missing or empty`);

    const projectId = state.projectId;

    return actions.copyLgTemplate({
      file,
      projectId,
      fromTemplateName,
      toTemplateName,
    });
  }

  function removeLgTemplateHandler({ id, templateName }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplate({
      file,
      projectId,
      templateName,
    });
  }

  function removeLgTemplatesHandler({ id, templateNames }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateNames) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplates({
      file,
      projectId,
      templateNames,
    });
  }

  /**
   *
   * @param {
   * id: string,
   * intentName: string,
   * intent: { name: string, body: string }
   * }
   *
   * @param {*} event
   */
  async function updateLuIntentHandler({ id, intentName, intent }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = luFiles.find(file => file.id === id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = luUtil.updateIntent(file.content, intentName, intent);

    return await updateLuFile({ id, projectId, content });
  }

  async function addLuIntentHandler({ id, intent }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = luFiles.find(file => file.id === id);
    if (!file) throw new Error(`lu file ${id} not found`);

    const content = luUtil.addIntent(file.content, intent);

    return await updateLuFile({ id, projectId, content });
  }

  async function removeLuIntentHandler({ id, intentName }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = luFiles.find(file => file.id === id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = luUtil.removeIntent(file.content, intentName);

    return await updateLuFile({ id, projectId, content });
  }

  async function updateRegExIntentHandler({ id, intentName, pattern }, event) {
    if (isEventSourceValid(event) === false) return false;
    const dialog = dialogs.find(dialog => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = updateRegExIntent(dialog, intentName, pattern);
    return await updateDialog({ id, content: newDialog.content });
  }

  async function fileHandler(fileTargetType, fileChangeType, { id, content }, event) {
    if (isEventSourceValid(event) === false) return false;

    const payload = {
      id,
      content,
      projectId,
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

  function cleanData() {
    const cleanedData = sanitizeDialogData(dialogsMap[dialogId]);
    if (!isEqual(dialogsMap[dialogId], cleanedData)) {
      const payload = {
        id: dialogId,
        content: cleanedData,
        projectId,
      };
      updateDialog(payload);
    }
  }

  function navTo({ path }) {
    cleanData();
    actions.navTo(path, breadcrumb);
  }

  function focusEvent({ subPath }) {
    cleanData();
    actions.selectTo(subPath);
  }

  function focusSteps({ subPaths = [], fragment }, event) {
    cleanData();
    let dataPath: string = subPaths[0];

    if (event.source.name === FORM_EDITOR) {
      // nothing focused yet, prepend the selected path
      if (!focused && selected) {
        dataPath = `${selected}.${dataPath}`;
      } else if (focused !== dataPath) {
        dataPath = `${focused}.${dataPath}`;
      }
    }

    actions.focusTo(dataPath, fragment);
  }

  function onSelect(ids: string[]) {
    actions.setVisualEditorSelection(ids);
  }

  function onCopy(copiedActions: any[]) {
    actions.setVisualEditorClipboard(copiedActions);
    // NOTES: fire a proactively state sync with VisualEditor
    // TODO: revisit how states should be synced via ShellApi without url refresh.
    const nextState: ShellData = {
      ...getState(VISUAL_EDITOR),
      clipboardActions: copiedActions,
    };
    apiClient.apiCall('reset', nextState, window.frames[VISUAL_EDITOR]);
  }

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('getState', (_, event) => {
      if (!event.source) {
        return {};
      }

      const source = event.source as Window;

      return getState(source.name);
    });
    apiClient.registerApi('saveData', handleValueChange);
    apiClient.registerApi('updateLuFile', ({ id, content }, event) => fileHandler(LU, UPDATE, { id, content }, event));
    apiClient.registerApi('updateLgFile', ({ id, content }, event) => fileHandler(LG, UPDATE, { id, content }, event));
    apiClient.registerApi('createLuFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('createLgFile', ({ id, content }, event) => fileHandler(LU, CREATE, { id, content }, event));
    apiClient.registerApi('updateLgTemplate', updateLgTemplateHandler);
    apiClient.registerApi('copyLgTemplate', copyLgTemplateHandler);
    apiClient.registerApi('removeLgTemplate', removeLgTemplateHandler);
    apiClient.registerApi('removeLgTemplates', removeLgTemplatesHandler);
    apiClient.registerApi('getLgTemplates', ({ id }, event) => getLgTemplates({ id }, event));
    apiClient.registerApi('addLuIntent', addLuIntentHandler);
    apiClient.registerApi('updateLuIntent', updateLuIntentHandler);
    apiClient.registerApi('removeLuIntent', removeLuIntentHandler);
    apiClient.registerApi('updateRegExIntent', updateRegExIntentHandler);
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('onFocusEvent', focusEvent);
    apiClient.registerApi('onFocusSteps', focusSteps);
    apiClient.registerApi('onSelect', onSelect);
    apiClient.registerApi('onCopy', onCopy);
    apiClient.registerApi('isExpression', ({ expression }) => isExpression(expression));
    apiClient.registerApi('createDialog', actionsSeed => {
      return new Promise(resolve => {
        actions.createDialogBegin(actionsSeed, (newDialog: string | null) => {
          resolve(newDialog);
        });
      });
    });
    apiClient.registerApi('undo', actions.undo);
    apiClient.registerApi('redo', actions.redo);
    apiClient.registerApi('addCoachMarkPosition', actions.onboardingAddCoachMarkRef);

    return () => {
      apiClient.disconnect();
    };
  }); // this is intented to reconstruct everytime store is refresh

  useEffect(() => {
    if (window.frames[VISUAL_EDITOR]) {
      const editorWindow = window.frames[VISUAL_EDITOR];
      apiClient.apiCall('reset', getState(VISUAL_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, focusPath, selected, focused, promptTab, projectId]);

  useEffect(() => {
    if (window.frames[FORM_EDITOR]) {
      const editorWindow = window.frames[FORM_EDITOR];
      apiClient.apiCall('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, focusPath, selected, focused, promptTab, projectId]);

  useEffect(() => {
    const schemaError = get(schemas, 'diagnostics', []);
    if (schemaError.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = schemaError.join('\n');
      OpenAlertModal(title, subTitle, { style: DialogStyle.Console });
    }
  }, [schemas, projectId]);

  return null;
};
