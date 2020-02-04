// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { ShellData } from '@botframework-ui/extension';
import isEqual from 'lodash/isEqual';

import { isAbsHosted } from './utils/envUtil';
import { StoreContext } from './store';
import { getDialogData, setDialogData, sanitizeDialogData } from './utils';

const VISUAL_EDITOR = 'VisualEditor';
const FORM_EDITOR = 'FormEditor';

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

function getFocusPath(selected: string, focused: string): string {
  if (selected && focused) return focused;

  if (!focused) return selected;

  return '';
}

function useShellApi() {
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

  function getState(): ShellData {
    const currentDialog = dialogs.find(d => d.id === dialogId);

    if (!currentDialog) {
      return {} as ShellData;
    }

    return {
      data: getData(FORM_EDITOR),
      botName,
      dialogs,
      focusPath,
      // @ts-ignore
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

  function saveData(newData, updatePath) {
    const dataPath = updatePath || focused || '';

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

  function focusSteps(subPaths, fragment) {
    cleanData();
    let dataPath: string = (subPaths || [])[0];

    // nothing focused yet, prepend the selected path
    if (!focused && selected) {
      dataPath = `${selected}.${dataPath}`;
    } else if (focused !== dataPath) {
      dataPath = `${focused}.${dataPath}`;
    }

    actions.focusTo(dataPath, fragment);
  }

  return {
    getState,
    saveData,
    onFocusSteps: focusSteps,
  };
}

export { useShellApi };
