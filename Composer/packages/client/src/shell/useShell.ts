// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo, useRef } from 'react';
import { ShellApi, ShellData, Shell, fetchFromSettings } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { updateRegExIntent, renameRegExIntent, updateIntentTrigger } from '../utils/dialogUtil';
import { getDialogData, setDialogData } from '../utils/dialogUtil';
import { isAbsHosted } from '../utils/envUtil';
import { undoFunctionState } from '../recoilModel/undo/history';
import {
  botNameState,
  schemasState,
  skillsState,
  lgFilesState,
  dialogSchemasState,
  projectIdState,
  localeState,
  luFilesState,
  qnaFilesState,
  dispatcherState,
  breadcrumbState,
  designPageLocationState,
  focusPathState,
  userSettingsState,
  clipboardActionsState,
  settingsState,
} from '../recoilModel';
import { validatedDialogsSelector } from '../recoilModel/selectors/validatedDialogs';

import { useLgApi } from './lgApi';
import { useLuApi } from './luApi';
import { useQnaApi } from './qnaApi';
import { useTriggerApi } from './triggerApi';

const FORM_EDITOR = 'PropertyEditor';

type EventSource = 'FlowEditor' | 'PropertyEditor' | 'DesignPage';

export function useShell(source: EventSource): Shell {
  const dialogMapRef = useRef({});
  const botName = useRecoilValue(botNameState);
  const dialogs = useRecoilValue(validatedDialogsSelector);
  const dialogSchemas = useRecoilValue(dialogSchemasState);
  const luFiles = useRecoilValue(luFilesState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  const locale = useRecoilValue(localeState);
  const lgFiles = useRecoilValue(lgFilesState);
  const skills = useRecoilValue(skillsState);
  const schemas = useRecoilValue(schemasState);
  const designPageLocation = useRecoilValue(designPageLocationState);
  const breadcrumb = useRecoilValue(breadcrumbState);
  const focusPath = useRecoilValue(focusPathState);
  const userSettings = useRecoilValue(userSettingsState);
  const clipboardActions = useRecoilValue(clipboardActionsState);
  const { undo, redo, commitChanges } = useRecoilValue(undoFunctionState);
  const settings = useRecoilValue(settingsState);
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
    updateSkillsInSetting,
  } = useRecoilValue(dispatcherState);
  const lgApi = useLgApi();
  const luApi = useLuApi();
  const qnaApi = useQnaApi();
  const triggerApi = useTriggerApi();
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
    return updateDialog({ id, content: newDialog.content });
  }

  function renameRegExIntentHandler(id: string, intentName: string, newIntentName: string) {
    const dialog = dialogs.find((dialog) => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = renameRegExIntent(dialog, intentName, newIntentName);
    updateDialog({ id, content: newDialog.content });
  }

  function updateIntentTriggerHandler(id: string, intentName: string, newIntentName: string) {
    const dialog = dialogs.find((dialog) => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = updateIntentTrigger(dialog, intentName, newIntentName);
    updateDialog({ id, content: newDialog.content });
  }

  function navigationTo(path) {
    navTo(path, breadcrumb);
  }

  function focusEvent(subPath) {
    selectTo(subPath);
  }

  function focusSteps(subPaths: string[] = [], fragment?: string) {
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
      };
      dialogMapRef.current[dialogId] = updatedDialog;
      updateDialog(payload);
      commitChanges();
    },
    ...lgApi,
    ...luApi,
    ...qnaApi,
    ...triggerApi,
    updateRegExIntent: updateRegExIntentHandler,
    renameRegExIntent: renameRegExIntentHandler,
    updateIntentTrigger: updateIntentTriggerHandler,
    navTo: navigationTo,
    onFocusEvent: focusEvent,
    onFocusSteps: focusSteps,
    onSelect: setVisualEditorSelection,
    onCopy: setVisualEditorClipboard,
    createDialog: (actionsSeed) => {
      return new Promise((resolve) => {
        createDialogBegin(actionsSeed, (newDialog: string | null) => {
          resolve(newDialog);
        });
      });
    },
    addSkillDialog: () => {
      return new Promise((resolve) => {
        addSkillDialogBegin((newSkill: { manifestUrl: string } | null) => {
          resolve(newSkill);
        });
      });
    },
    undo,
    redo,
    commitChanges,
    addCoachMarkRef: onboardingAddCoachMarkRef,
    updateUserSettings: updateUserSettings,
    announce: setMessage,
    displayManifestModal: displayManifestModal,
    updateDialogSchema,
    skillsInSettings: {
      get: (path: string) => fetchFromSettings(path, settings),
      set: updateSkillsInSetting,
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
        qnaFiles,
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
