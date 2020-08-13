// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo, useRef } from 'react';
import { ShellApi, ShellData, Shell, DialogSchemaFile } from '@bfc/shared';
import isEqual from 'lodash/isEqual';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { updateRegExIntent } from '../utils/dialogUtil';
import { getDialogData, setDialogData, sanitizeDialogData } from '../utils/dialogUtil';
import { getFocusPath } from '../utils/navigation';
import { isAbsHosted } from '../utils/envUtil';
import { undoFunctionState } from '../recoilModel/undo/history';
import {
  dispatcherState,
  userSettingsState,
  clipboardActionsState,
  botStateByProjectIdSelector,
  currentProjectIdState,
  designPageLocationState,
} from '../recoilModel';

import { useLgApi } from './lgApi';
import { useLuApi } from './luApi';

const FORM_EDITOR = 'PropertyEditor';

type EventSource = 'FlowEditor' | 'PropertyEditor' | 'DesignPage';

export function useShell(source: EventSource): Shell {
  const dialogMapRef = useRef({});
  const {
    focusPath,
    breadcrumb,
    schemas,
    skills,
    botName,
    validatedDialogs: dialogs,
    luFiles,
    locale,
    lgFiles,
    dialogSchemas,
  } = useRecoilValue(botStateByProjectIdSelector);
  const designPageLocation = useRecoilValue(designPageLocationState);

  const projectId = useRecoilValue(currentProjectIdState);

  const userSettings = useRecoilValue(userSettingsState);
  const clipboardActions = useRecoilValue(clipboardActionsState);
  const { undo, redo, commitChanges } = useRecoilValue(undoFunctionState);
  const {
    updateDialog,
    updateDialogSchema,
    createDialogBegin,
    navTo,
    focusTo,
    selectTo,
    setVisualEditorSelection,
    setVisualEditorClipboard,
    addSkillDialogBegin,
    onboardingAddCoachMarkRef,
    updateUserSettings,
    setMessage,
    displayManifestModal,
  } = useRecoilValue(dispatcherState);

  const lgApi = useLgApi();
  const luApi = useLuApi();

  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  function updateRegExIntentHandler(id, intentName, pattern) {
    const dialog = dialogs.find((dialog) => dialog.id === id);
    if (!dialog) throw new Error(formatMessage(`dialog {dialogId} not found`, { dialogId }));
    const newDialog = updateRegExIntent(dialog, intentName, pattern);
    return updateDialog({ id, content: newDialog.content, projectId });
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

  function navigationTo(path) {
    cleanData();
    navTo(path, breadcrumb);
  }

  function focusEvent(subPath) {
    cleanData();
    selectTo(subPath);
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

    focusTo(dataPath, fragment ?? '');
  }

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
         *   - If 'trigger' not exists at `selected` path, fallback to dialog Id;
         *   - If 'dialog' not exists at `dialogId` path, fallback to main dialog.
         */
        navTo(dialogId, []);
      }
      commitChanges();
    },
    ...lgApi,
    ...luApi,
    updateRegExIntent: updateRegExIntentHandler,
    navTo: navigationTo,
    onFocusEvent: focusEvent,
    onFocusSteps: focusSteps,
    onSelect: setVisualEditorSelection,
    onCopy: setVisualEditorClipboard,
    createDialog: (actionsSeed) => {
      return new Promise((resolve) => {
        createDialogBegin(
          actionsSeed,
          (newDialog: string | null) => {
            resolve(newDialog);
          },
          projectId
        );
      });
    },
    addSkillDialog: () => {
      return new Promise((resolve) => {
        addSkillDialogBegin((newSkill: { manifestUrl: string } | null) => {
          resolve(newSkill);
        }, projectId);
      });
    },
    undo,
    redo,
    commitChanges,
    addCoachMarkRef: onboardingAddCoachMarkRef,
    updateUserSettings: updateUserSettings,
    announce: setMessage,
    displayManifestModal: (skillId) => displayManifestModal(skillId, projectId),
    updateDialogSchema: async (dialogSchema: DialogSchemaFile) => {
      updateDialogSchema(dialogSchema, projectId);
    },
  };

  const currentDialog = useMemo(() => dialogs.find((d) => d.id === dialogId), [dialogs, dialogId]);
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
        dialogSchemas,
        dialogId,
        focusPath,
        schemas,
        lgFiles,
        luFiles,
        currentDialog,
        userSettings,
        designerId: editorData?.$designer?.id,
        focusedEvent: selected,
        focusedActions: focused ? [focused] : [],
        focusedSteps: focused ? [focused] : selected ? [selected] : [],
        focusedTab: promptTab,
        clipboardActions,
        hosted: !!isAbsHosted(),
        skills,
      }
    : ({} as ShellData);

  return {
    api,
    data,
  };
}
