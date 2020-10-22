// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo, useRef } from 'react';
import { ShellApi, ShellData, Shell, DialogSchemaFile, DialogInfo } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { updateRegExIntent, renameRegExIntent, updateIntentTrigger } from '../utils/dialogUtil';
import { getDialogData, setDialogData } from '../utils/dialogUtil';
import { isAbsHosted } from '../utils/envUtil';
import {
  dispatcherState,
  userSettingsState,
  settingsState,
  clipboardActionsState,
  schemasState,
  validateDialogSelectorFamily,
  breadcrumbState,
  focusPathState,
  localeState,
  qnaFilesState,
  designPageLocationState,
  botDisplayNameState,
  dialogSchemasState,
  lgFilesState,
  luFilesState,
  rateInfoState,
} from '../recoilModel';
import { undoFunctionState } from '../recoilModel/undo/history';
import { skillsStateSelector } from '../recoilModel/selectors';

import { useLgApi } from './lgApi';
import { useLuApi } from './luApi';
import { useQnaApi } from './qnaApi';
import { useTriggerApi } from './triggerApi';
import { useActionApi } from './actionApi';

const FORM_EDITOR = 'PropertyEditor';

type EventSource = 'FlowEditor' | 'PropertyEditor' | 'DesignPage' | 'VaCreation';

const stubDialog = (): DialogInfo => ({
  content: {
    $kind: '',
  },
  diagnostics: [],
  displayName: '',
  id: '',
  isRoot: true,
  lgFile: '',
  lgTemplates: [],
  luFile: '',
  qnaFile: '',
  referredLuIntents: [],
  referredDialogs: [],
  triggers: [],
  intentTriggers: [],
  skills: [],
});

export function useShell(source: EventSource, projectId: string): Shell {
  const dialogMapRef = useRef({});

  const schemas = useRecoilValue(schemasState(projectId));
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));
  const breadcrumb = useRecoilValue(breadcrumbState(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const skills = useRecoilValue(skillsStateSelector);
  const locale = useRecoilValue(localeState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const undoFunction = useRecoilValue(undoFunctionState(projectId));
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const { undo, redo, commitChanges } = undoFunction;
  const luFiles = useRecoilValue(luFilesState(projectId));
  const lgFiles = useRecoilValue(lgFilesState(projectId));
  const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const flowZoomRate = useRecoilValue(rateInfoState);

  const userSettings = useRecoilValue(userSettingsState);
  const clipboardActions = useRecoilValue(clipboardActionsState);
  const {
    updateDialog,
    updateDialogSchema,
    createDialogBegin,
    navTo,
    focusTo,
    selectTo,
    setVisualEditorSelection,
    setVisualEditorClipboard,
    onboardingAddCoachMarkRef,
    updateUserSettings,
    setMessage,
    displayManifestModal,
    updateSkillsDataInBotProjectFile: updateEndpointInBotProjectFile,
    updateZoomRate,
  } = useRecoilValue(dispatcherState);

  const lgApi = useLgApi(projectId);
  const luApi = useLuApi(projectId);
  const qnaApi = useQnaApi(projectId);
  const triggerApi = useTriggerApi(projectId);
  const actionApi = useActionApi(projectId);
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
    updateDialog({ id, content: newDialog.content, projectId });
  }

  function renameRegExIntentHandler(id: string, intentName: string, newIntentName: string) {
    const dialog = dialogs.find((dialog) => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = renameRegExIntent(dialog, intentName, newIntentName);
    updateDialog({ id, content: newDialog.content, projectId });
  }

  function updateIntentTriggerHandler(id: string, intentName: string, newIntentName: string) {
    const dialog = dialogs.find((dialog) => dialog.id === id);
    if (!dialog) throw new Error(`dialog ${dialogId} not found`);
    const newDialog = updateIntentTrigger(dialog, intentName, newIntentName);
    updateDialog({ id, content: newDialog.content, projectId });
  }

  function navigationTo(path) {
    navTo(projectId, null, path, breadcrumb);
  }

  function focusEvent(subPath) {
    selectTo(projectId, null, null, subPath);
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

    focusTo(projectId, dataPath, fragment ?? '');
  }

  function updateFlowZoomRate(currentRate) {
    updateZoomRate({ currentRate });
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
      commitChanges();
    },
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
        createDialogBegin(
          actionsSeed,
          (newDialog: string | null) => {
            resolve(newDialog);
          },
          projectId
        );
      });
    },
    undo,
    redo,
    commitChanges,
    addCoachMarkRef: onboardingAddCoachMarkRef,
    updateUserSettings,
    announce: setMessage,
    displayManifestModal: (skillId) => displayManifestModal(skillId, projectId),
    updateDialogSchema: async (dialogSchema: DialogSchemaFile) => {
      updateDialogSchema(dialogSchema, projectId);
    },
    updateSkill: async (skillId: string, skillsData) => {
      updateEndpointInBotProjectFile(skillId, skillsData.skill, skillsData.selectedEndpointIndex);
    },
    updateFlowZoomRate,
    ...lgApi,
    ...luApi,
    ...qnaApi,
    ...triggerApi,
    ...actionApi,
  };

  const currentDialog = useMemo(() => dialogs.find((d) => d.id === dialogId) ?? stubDialog(), [
    dialogs,
    dialogId,
  ]) as DialogInfo;
  const editorData = useMemo(() => {
    return source === 'PropertyEditor'
      ? getDialogData(dialogsMap, dialogId, focused || selected || '')
      : getDialogData(dialogsMap, dialogId);
  }, [source, dialogsMap, dialogId, focused, selected]);

  const data: ShellData = {
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
    luFeatures: settings.luFeatures,
    skills,
    skillsSettings: settings.skill || {},
    flowZoomRate,
  };

  return {
    api,
    data,
  };
}
