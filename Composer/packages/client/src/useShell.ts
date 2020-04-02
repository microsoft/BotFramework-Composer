// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useContext, useMemo } from 'react';
import { ShellApi, ShellData } from '@bfc/shared';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import * as lgUtil from './utils/lgUtil';
import * as luUtil from './utils/luUtil';
import { updateRegExIntent } from './utils/dialogUtil';
import { StoreContext } from './store';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { getFocusPath } from './utils/navigation';
import { isAbsHosted } from './utils/envUtil';

const FORM_EDITOR = 'PropertyEditor';

type EventSource = 'VisualEditor' | 'PropertyEditor';

export function useShell(source: EventSource): { api: ShellApi; data: ShellData } {
  const { state, actions, resolvers } = useContext(StoreContext);
  const { lgFileResolver, luFileResolver } = resolvers;
  const {
    botName,
    breadcrumb,
    designPageLocation,
    dialogs,
    focusPath,
    lgFiles,
    locale,
    luFiles,
    projectId,
    schemas,
  } = state;
  const updateDialog = actions.updateDialog;
  const updateLuFile = actions.updateLuFile; //if debounced, error can't pass to form
  const updateLgTemplate = actions.updateLgTemplate;

  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  function getLgTemplates(id) {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = focusPath.split('#').shift() || id;
    const file = lgFileResolver(focusedDialogId);
    if (!file) throw new Error(`lg file ${id} not found`);
    return file.templates;
  }

  async function updateLgTemplateHandler(id: string, templateName: string, templateBody: string) {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);
    const template = { name: templateName, body: templateBody, parameters: [] };

    const projectId = state.projectId;

    lgUtil.checkSingleLgTemplate(template);

    await updateLgTemplate({
      file,
      projectId,
      templateName,
      template,
    });
  }

  async function copyLgTemplateHandler(id, fromTemplateName, toTemplateName) {
    const file = lgFileResolver(id);
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

  async function removeLgTemplateHandler(id, templateName) {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplate({
      file,
      projectId,
      templateName,
    });
  }

  async function removeLgTemplatesHandler(id, templateNames) {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateNames) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplates({
      file,
      projectId,
      templateNames,
    });
  }

  async function updateLuIntentHandler(id, intentName, intent) {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = luUtil.updateIntent(file.content, intentName, intent);

    return await updateLuFile({ id, projectId, content });
  }

  async function removeLuIntentHandler(id, intentName) {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = luUtil.removeIntent(file.content, intentName);

    return await updateLuFile({ id, projectId, content });
  }

  async function updateRegExIntentHandler(id, intentName, pattern) {
    const dialog = dialogs.find(dialog => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = updateRegExIntent(dialog, intentName, pattern);
    return await updateDialog({ id, content: newDialog.content });
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

  function navTo(path) {
    cleanData();
    actions.navTo(path, breadcrumb);
  }

  function focusEvent(subPath) {
    cleanData();
    actions.selectTo(subPath);
  }

  function focusSteps(subPaths: string[] = [], fragment?: string) {
    cleanData();
    let dataPath: string = subPaths[0];

    if (source === FORM_EDITOR) {
      // nothing focused yet, prepend the selected path
      if (!focused && selected) {
        dataPath = `${selected}.${dataPath}`;
      } else if (focused !== dataPath) {
        dataPath = `${focused}.${dataPath}`;
      }
    }

    actions.focusTo(dataPath, fragment);
  }

  // ANDY: should this be somewhere else?
  useEffect(() => {
    const schemaError = get(schemas, 'diagnostics', []);
    if (schemaError.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = schemaError.join('\n');
      OpenAlertModal(title, subTitle, { style: DialogStyle.Console });
    }
  }, [schemas, projectId]);

  const api: ShellApi = {
    saveData: (newData, updatePath) => {
      let dataPath = '';
      if (source === FORM_EDITOR) {
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
    },
    getLgTemplates,
    updateLgTemplate: updateLgTemplateHandler,
    copyLgTemplate: copyLgTemplateHandler,
    removeLgTemplate: removeLgTemplateHandler,
    removeLgTemplates: removeLgTemplatesHandler,
    updateLuIntent: updateLuIntentHandler,
    updateRegExIntent: updateRegExIntentHandler,
    removeLuIntent: removeLuIntentHandler,
    navTo,
    onFocusEvent: focusEvent,
    onFocusSteps: focusSteps,
    onSelect: actions.setVisualEditorSelection,
    onCopy: actions.setVisualEditorClipboard,
    createDialog: actionsSeed => {
      return new Promise(resolve => {
        actions.createDialogBegin(actionsSeed, (newDialog: string | null) => {
          resolve(newDialog);
        });
      });
    },
    undo: actions.undo,
    redo: actions.redo,
    addCoachMarkRef: actions.onboardingAddCoachMarkRef,
  };

  const currentDialog = dialogs.find(d => d.id === dialogId);
  const editorData =
    source === 'PropertyEditor'
      ? getDialogData(dialogsMap, dialogId, focused || selected || '')
      : getDialogData(dialogsMap, dialogId);

  const data: ShellData = currentDialog
    ? {
        data: editorData,
        locale,
        botName,
        projectId,
        dialogs,
        dialogId,
        focusPath,
        schemas,
        lgFiles,
        luFiles,
        currentDialog,
        designerId: get(editorData, '$designer.id'),
        focusedEvent: selected,
        focusedActions: focused ? [focused] : [],
        focusedSteps: focused ? [focused] : selected ? [selected] : [],
        focusedTab: promptTab,
        clipboardActions: state.clipboardActions,
        hosted: !!isAbsHosted(),
      }
    : ({} as ShellData);

  return {
    api,
    data,
  };
}
