// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useContext, useMemo, useState } from 'react';
import { ShellData } from '@bfc/shared';
import isEqual from 'lodash.isequal';
import get from 'lodash.get';

import { parseLgTemplate, checkLgContent, updateTemplateInContent } from '../src/store/action/lg';

import { isExpression } from './utils';
import * as lgUtil from './utils/lgUtil';
import { StoreContext } from './store';
import ApiClient from './messenger/ApiClient';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';
import { isAbsHosted } from './utils/envUtil';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { getFocusPath, navigateTo } from './utils/navigation';

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

const shellNavigator = (shellPage: string, opts: { id?: string } = {}) => {
  switch (shellPage) {
    case 'lu':
      navigateTo(`/language-understanding/${opts.id}`);
      return;
    default:
      return;
  }
};

export const ShellApi: React.FC = () => {
  const { state, actions } = useContext(StoreContext);

  const { dialogs, schemas, lgFiles, luFiles, designPageLocation, focusPath, breadcrumb, botName } = state;
  const updateDialog = actions.updateDialog;
  const updateLuFile = actions.updateLuFile; //if debounced, error can't pass to form
  const updateLgFile = actions.updateLgFile;
  const updateLgTemplate = actions.updateLgTemplate;
  const createLuFile = actions.createLuFile;
  const createLgFile = actions.createLgFile;

  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const { LG, LU } = FileTargetTypes;
  const { CREATE, UPDATE } = FileChangeTypes;

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
    apiClient.registerApi('removeLgTemplate', removeLgTemplateHandler);
    apiClient.registerApi('getLgTemplates', ({ id }, event) => getLgTemplates({ id }, event));
    apiClient.registerApi('navTo', navTo);
    apiClient.registerApi('onFocusEvent', focusEvent);
    apiClient.registerApi('onFocusSteps', focusSteps);
    apiClient.registerApi('onSelect', onSelect);
    apiClient.registerApi('onCopy', onCopy);
    apiClient.registerApi('shellNavigate', ({ shellPage, opts }) => shellNavigator(shellPage, opts));
    apiClient.registerApi('isExpression', ({ expression }) => isExpression(expression));
    apiClient.registerApi('createDialog', () => {
      return new Promise(resolve => {
        actions.createDialogBegin((newDialog: string | null) => {
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
  }, [dialogs, lgFiles, luFiles, focusPath, selected, focused, promptTab]);

  useEffect(() => {
    if (window.frames[FORM_EDITOR]) {
      const editorWindow = window.frames[FORM_EDITOR];
      apiClient.apiCall('reset', getState(FORM_EDITOR), editorWindow);
    }
  }, [dialogs, lgFiles, luFiles, focusPath, selected, focused, promptTab]);

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
      return getDialogData(dialogsMap, dialogId, focused || selected || '');
    }

    return '';
  }

  function getState(sourceWindow?: string): ShellData {
    const currentDialog = dialogs.find(d => d.id === dialogId);

    if (!currentDialog) {
      return {} as ShellData;
    }

    return {
      data: getData(sourceWindow),
      botName,
      dialogs,
      focusPath,
      schemas,
      lgFiles,
      luFiles,
      currentDialog,
      dialogId,
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

    await updateLgTemplate({
      file,
      templateName,
      template,
    });

    const content = updateTemplateInContent({ content: file.content, templateName, template });
    return checkLgContent(content);
  }

  function removeLgTemplateHandler({ id, templateName }, event) {
    if (isEventSourceValid(event) === false) return false;
    const file = lgFiles.find(file => file.id === id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);

    return actions.removeLgTemplate({
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

  function cleanData() {
    const cleanedData = sanitizeDialogData(dialogsMap[dialogId]);
    if (!isEqual(dialogsMap[dialogId], cleanedData)) {
      const payload = {
        id: dialogId,
        content: cleanedData,
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

  return null;
};
