// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo, useRef } from 'react';
import {
  ShellApi,
  ShellData,
  Shell,
  DialogSchemaFile,
  DialogInfo,
  BotInProject,
  FeatureFlagKey,
  SDKKinds,
} from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { OpenConfirmModal } from '@bfc/ui-shared';

import httpClient from '../utils/httpUtil';
import { updateRegExIntent, renameRegExIntent, updateIntentTrigger } from '../utils/dialogUtil';
import { getDialogData, setDialogData } from '../utils/dialogUtil';
import { isAbsHosted } from '../utils/envUtil';
import {
  botProjectSpaceSelector,
  dispatcherState,
  userSettingsState,
  settingsState,
  clipboardActionsState,
  schemasState,
  focusPathState,
  localeState,
  qnaFilesSelectorFamily,
  designPageLocationState,
  botDisplayNameState,
  dialogSchemasState,
  luFilesSelectorFamily,
  rateInfoState,
  rootBotProjectIdSelector,
  featureFlagsState,
} from '../recoilModel';
import { undoFunctionState } from '../recoilModel/undo/history';
import { dialogsWithLuProviderSelectorFamily, skillsStateSelector } from '../recoilModel/selectors';
import { navigateTo } from '../utils/navigation';
import TelemetryClient from '../telemetry/TelemetryClient';
import { lgFilesSelectorFamily } from '../recoilModel/selectors/lg';
import { getMemoryVariables } from '../recoilModel/dispatchers/utils/project';

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
  const dialogs = useRecoilValue(dialogsWithLuProviderSelectorFamily(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const skills = useRecoilValue(skillsStateSelector);
  const locale = useRecoilValue(localeState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const undoFunction = useRecoilValue(undoFunctionState(projectId));
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const { undo, redo, commitChanges } = undoFunction;
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const lgFiles = useRecoilValue(lgFilesSelectorFamily(projectId));
  const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const flowZoomRate = useRecoilValue(rateInfoState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const isRootBot = rootBotProjectId === projectId;
  const projectCollection = useRecoilValue<BotInProject[]>(botProjectSpaceSelector).map((bot) => ({
    ...bot,
    hasWarnings: false,
  }));

  const userSettings = useRecoilValue(userSettingsState);
  const clipboardActions = useRecoilValue(clipboardActionsState(projectId));
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
    onboardingAddCoachMarkRef,
    updateUserSettings,
    setMessage,
    displayManifestModal,
    updateSkillsDataInBotProjectFile: updateEndpointInBotProjectFile,
    updateZoomRate,
    reloadProject,
    setApplicationLevelError,
    updateRecognizer,
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

  async function openDialog(dialogId: string) {
    await navTo(projectId, dialogId, '"beginDialog"');
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
    onOpenDialog: openDialog,
    onFocusEvent: focusEvent,
    onFocusSteps: focusSteps,
    onSelect: setVisualEditorSelection,
    onCopy: (clipboardActions) => setVisualEditorClipboard(clipboardActions, projectId),
    createDialog: (actionsSeed = []) => {
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
    displayManifestModal: (skillId) => displayManifestModal(skillId),
    isFeatureEnabled: (featureFlagKey: FeatureFlagKey): boolean => featureFlags?.[featureFlagKey]?.enabled ?? false,
    updateDialogSchema: async (dialogSchema: DialogSchemaFile) => {
      updateDialogSchema(dialogSchema, projectId);
    },
    updateSkill: async (skillId: string, skillsData) => {
      updateEndpointInBotProjectFile(skillId, skillsData.skill, skillsData.selectedEndpointIndex);
    },
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
    telemetryClient: TelemetryClient,
    getMemoryVariables,
  };

  const currentDialog = useMemo(() => {
    let result: any = dialogs.find((d) => d.id === dialogId) ?? dialogs.find((dialog) => dialog.isRoot);
    if (!result) {
      // Should not hit here as the seed content should atleast be the root dialog if no current dialog
      result = stubDialog();
    }
    return result;
  }, [dialogs, dialogId]);

  const editorData = useMemo(() => {
    return source === 'PropertyEditor'
      ? getDialogData(dialogsMap, dialogId, focused || selected || '')
      : getDialogData(dialogsMap, dialogId);
  }, [source, dialogsMap, dialogId, focused, selected]);

  const data: ShellData = {
    locale,
    botName,
    projectId,
    projectCollection,
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
    forceDisabledActions: isRootBot
      ? []
      : [
          {
            kind: SDKKinds.BeginSkill,
            reason: formatMessage('You can only connect to a skill in the root bot.'),
          },
        ],
    settings,
    httpClient,
  };

  return {
    api,
    data,
  };
}
