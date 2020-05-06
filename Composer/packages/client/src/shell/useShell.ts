// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useContext, useMemo, useRef } from 'react';
import { ShellApi, ShellData } from '@bfc/shared';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import { updateRegExIntent } from '../utils/dialogUtil';
import { StoreContext } from '../store';
import { getDialogData, setDialogData, sanitizeDialogData } from '../utils';
import { OpenAlertModal, DialogStyle } from '../components/Modal';
import { getFocusPath } from '../utils/navigation';
import { isAbsHosted } from '../utils/envUtil';

import { useLgApi } from './lgApi';
import { useLuApi } from './luApi';

const FORM_EDITOR = 'PropertyEditor';

type EventSource = 'VisualEditor' | 'PropertyEditor' | 'ProjectTree';

export function useShell(source: EventSource): { api: ShellApi; data: ShellData } {
  const { state, actions } = useContext(StoreContext);
  const dialogMapRef = useRef({});
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
    userSettings,
    skills,
  } = state;
  const lgApi = useLgApi();
  const luApi = useLuApi();
  const updateDialog = actions.updateDialog;

  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

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

  dialogMapRef.current = dialogsMap;

  const api: ShellApi = {
    getDialog: (dialogId: string) => {
      return dialogMapRef.current[dialogId];
    },
    saveDialog: (dialogId: string, newDialogData: any) => {
      dialogMapRef.current[dialogId] = newDialogData;
      updateDialog({
        id: dialogId,
        content: newDialogData,
        projectId,
      });
    },
    saveData: (newData, updatePath) => {
      let dataPath = '';
      if (source === FORM_EDITOR) {
        dataPath = updatePath || focused || '';
      }

      const updatedDialog = setDialogData(dialogMapRef.current, dialogId, dataPath, newData);
      const payload = {
        id: dialogId,
        content: updatedDialog,
        projectId,
      };
      dialogMapRef.current[dialogId] = updatedDialog;
      updateDialog(payload);

      //make sure focusPath always valid
      const data = getDialogData(dialogMapRef.current, dialogId, getFocusPath(selected, focused));
      if (typeof data === 'undefined') {
        /**
         * It's improper to fallback to `dialogId` directly:
         *   - If 'action' not exists at `focused` path, fallback to trigger path;
         *   - If 'trigger' not exisits at `selected` path, fallback to dialog Id;
         *   - If 'dialog' not exists at `dialogId` path, fallback to main dialog.
         */
        actions.navTo(dialogId);
      }
    },
    ...lgApi,
    ...luApi,
    updateRegExIntent: updateRegExIntentHandler,
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
    addSkillDialog: () => {
      return new Promise(resolve => {
        actions.addSkillDialogBegin((newSkill: { manifestUrl: string } | null) => {
          resolve(newSkill);
        });
      });
    },
    undo: actions.undo,
    redo: actions.redo,
    addCoachMarkRef: actions.onboardingAddCoachMarkRef,
    updateUserSettings: actions.updateUserSettings,
    announce: actions.setMessage,
  };

  const currentDialog = useMemo(() => dialogs.find(d => d.id === dialogId), [dialogs, dialogId]);
  const editorData = useMemo(() => {
    return source === 'PropertyEditor'
      ? getDialogData(dialogsMap, dialogId, focused || selected || '')
      : getDialogData(dialogsMap, dialogId);
  }, [source, dialogsMap, dialogId, focused, selected]);

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
        userSettings,
        designerId: get(editorData, '$designer.id'),
        focusedEvent: selected,
        focusedActions: focused ? [focused] : [],
        focusedSteps: focused ? [focused] : selected ? [selected] : [],
        focusedTab: promptTab,
        clipboardActions: state.clipboardActions,
        hosted: !!isAbsHosted(),
        skills,
      }
    : ({} as ShellData);

  return {
    api,
    data,
  };
}
