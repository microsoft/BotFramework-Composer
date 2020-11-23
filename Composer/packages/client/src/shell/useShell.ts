// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo, useRef } from 'react';
import { ShellApi, ShellData, Shell, DialogSchemaFile, DialogInfo, FeatureFlagKey } from '@botframework-composer/types';
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
  validateDialogsSelectorFamily,
  focusPathState,
  skillsState,
  localeState,
  qnaFilesState,
  designPageLocationState,
  botDisplayNameState,
  dialogSchemasState,
  lgFilesState,
  luFilesState,
  rateInfoState,
  rootBotProjectIdSelector,
  featureFlagsState,
} from '../recoilModel';
import { undoFunctionState } from '../recoilModel/undo/history';
import httpClient from '../utils/httpUtil';
import { navigateTo } from '../utils/navigation';
import { OpenConfirmModal } from '../components/Modal/ConfirmDialog';

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
  isFormDialog: false,
});

export function useShell(source: EventSource, projectId: string): Shell {
  const dialogMapRef = useRef({});

  const schemas = useRecoilValue(schemasState(projectId));
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const skills = useRecoilValue(skillsState(projectId));
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
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const userSettings = useRecoilValue(userSettingsState);
  const clipboardActions = useRecoilValue(clipboardActionsState);
  const featureFlags = useRecoilValue(featureFlagsState);
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
    updateSkill,
    updateZoomRate,
    updateRecognizer,
    reloadProject,
    setApplicationLevelError,
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

  async function navigationTo(path, rest?) {
    if (rootBotProjectId == null) return;
    await navTo(projectId, path, rest);
  }

  async function focusEvent(subPath) {
    if (rootBotProjectId == null) return;
    await selectTo(projectId, dialogId, subPath);
  }

  async function focusSteps(subPaths: string[] = [], fragment?: string) {
    let dataPath: string = subPaths[0];

    if (source === FORM_EDITOR) {
      // nothing focused yet, prepend the selected path
      if (!focused && selected) {
        dataPath = `${selected}.${dataPath}`;
      } else if (focused !== dataPath) {
        dataPath = `${focused}.${dataPath}`;
      }
    }
    await focusTo(rootBotProjectId ?? projectId, projectId, dataPath, fragment ?? '');
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
    saveData: (newData, updatePath, callback) => {
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
      return updateDialog(payload).then(async () => {
        if (typeof callback === 'function') {
          await callback();
        }
        commitChanges();
      });
    },
    updateRecognizer,
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
    addSkillDialog: () => {
      return new Promise((resolve) => {
        addSkillDialogBegin((newSkill: { manifestUrl: string; name: string } | null) => {
          resolve(newSkill);
        }, projectId);
      });
    },
    undo,
    redo,
    commitChanges,
    displayManifestModal: (skillId) => displayManifestModal(skillId, projectId),
    isFeatureEnabled: (featureFlagKey: FeatureFlagKey): boolean => featureFlags?.[featureFlagKey]?.enabled ?? false,
    updateDialogSchema: async (dialogSchema: DialogSchemaFile) => {
      updateDialogSchema(dialogSchema, projectId);
    },
    updateSkillSetting: (...params) => updateSkill(projectId, ...params),
    updateFlowZoomRate,
    reloadProject: () => reloadProject(projectId),
    ...lgApi,
    ...luApi,
    ...qnaApi,
    ...triggerApi,
    ...actionApi,

    // application context
    addCoachMarkRef: onboardingAddCoachMarkRef,
    announce: setMessage,
    navigateTo,
    setApplicationLevelError,
    updateUserSettings,
    confirm: OpenConfirmModal,
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
    settings,
    httpClient,
  };

  return {
    api,
    data,
  };
}
