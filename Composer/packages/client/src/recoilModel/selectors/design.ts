// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';
import { validateDialog } from '@bfc/indexers';

import {
  currentProjectIdState,
  dialogsState,
  schemasState,
  locationState,
  botStatusState,
  botDiagnosticsState,
  botEnvironmentState,
  localeState,
  lgFilesState,
  luFilesState,
  skillsState,
  botLoadErrorState,
  actionsSeedState,
  skillManifestsState,
  breadcrumbState,
  showCreateDialogModalState,
  showAddSkillDialogModalState,
  settingsState,
  publishVersionsState,
  publishStatusState,
  lastPublishChangeState,
  publishTypesState,
  publishHistoryState,
  onCreateDialogCompleteState,
  focusPathState,
  onAddSkillDialogCompleteState,
  displaySkillManifestState,
  showAddLanguageModalState,
  showDelLanguageModalState,
  onAddLanguageDialogCompleteState,
  onDelLanguageDialogCompleteState,
  botNameState,
  dialogSchemasState,
  designPageLocationState,
  projectMetaDataState,
  isEjectRuntimeExistState,
  qnaFilesState,
} from '../atoms';
import { undoFunctionState, undoVersionState } from '../undo/history';
import { dispatcherState } from '../DispatcherWrapper';
import { Dispatcher } from '../dispatchers';

export const botStateByProjectIdSelector = selector({
  key: 'botStateByProjectIdSelector',
  get: ({ get }) => {
    const projectId = get(currentProjectIdState);
    const dialogs = get(dialogsState(projectId));
    const schemas = get(schemasState(projectId));
    const botName = get(botNameState(projectId));
    const location = get(locationState(projectId));
    const botStatus = get(botStatusState(projectId));
    const diagnostics = get(botDiagnosticsState(projectId));
    const botEnvironment = get(botEnvironmentState(projectId));
    const locale = get(localeState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const luFiles = get(luFilesState(projectId));
    const skills = get(skillsState(projectId));
    const botLoadError = get(botLoadErrorState(projectId));
    const actionsSeed = get(actionsSeedState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const breadcrumb = get(breadcrumbState(projectId));
    const showCreateDialogModal = get(showCreateDialogModalState(projectId));
    const showAddSkillDialogModal = get(showAddSkillDialogModalState(projectId));
    const dialogSetting = get(settingsState(projectId));
    const publishVersions = get(publishVersionsState(projectId));
    const publishStatus = get(publishStatusState(projectId));
    const lastPublishChange = get(lastPublishChangeState(projectId));
    const publishTypes = get(publishTypesState(projectId));
    const publishHistory = get(publishHistoryState(projectId));
    const onCreateDialogComplete = get(onCreateDialogCompleteState(projectId));
    const focusPath = get(focusPathState(projectId));
    const onAddSkillDialogComplete = get(onAddSkillDialogCompleteState(projectId));
    const displaySkillManifest = get(displaySkillManifestState(projectId));
    const showAddLanguageModal = get(showAddLanguageModalState(projectId));
    const showDelLanguageModal = get(showDelLanguageModalState(projectId));
    const onAddLanguageDialogComplete = get(onAddLanguageDialogCompleteState(projectId));
    const onDelLanguageDialogComplete = get(onDelLanguageDialogCompleteState(projectId));
    const botLoadErrorMsg = get(botLoadErrorState(projectId));
    const dialogSchemas = get(dialogSchemasState(projectId));
    const designPageLocation = get(designPageLocationState(projectId));
    const undoFunction = get(undoFunctionState(projectId));
    const undoVersion = get(undoVersionState(projectId));
    const projectMetaData = get(projectMetaDataState(projectId));
    const isEjectRuntimeExist = get(isEjectRuntimeExistState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));

    const validatedDialogs = dialogs.map((dialog) => {
      return { ...dialog, diagnostics: validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles) };
    });

    return {
      botLoadErrorMsg,
      dialogs,
      validatedDialogs,
      schemas,
      botName,
      location,
      botStatus,
      diagnostics,
      botEnvironment,
      locale,
      luFiles,
      lgFiles,
      skills,
      botLoadError,
      actionsSeed,
      skillManifests,
      breadcrumb,
      showCreateDialogModal,
      showAddSkillDialogModal,
      dialogSetting,
      publishVersions,
      publishStatus,
      lastPublishChange,
      publishTypes,
      publishHistory,
      onCreateDialogComplete,
      focusPath,
      onAddSkillDialogComplete,
      displaySkillManifest,
      showAddLanguageModal,
      showDelLanguageModal,
      onAddLanguageDialogComplete,
      onDelLanguageDialogComplete,
      dialogSchemas,
      designPageLocation,
      undoFunction,
      undoVersion,
      projectMetaData,
      projectId,
      isEjectRuntimeExist,
      qnaFiles,
    };
  },
});

// TODO Load Bot Projects file

const loadBotProjects = (dispatcher: Dispatcher) => {
  return {
    onAction: async (validatedBotProject) => {
      const projectId = await dispatcher.openProject(validatedBotProject.workspace, 'default');
      dispatcher.addToBotProject(projectId, true);
      for (const skill of validatedBotProject.skills) {
        const projectId = await dispatcher.openProject(skill.workspace, 'default');
        dispatcher.addToBotProject(projectId, false);
      }
    },
  };
};

export const loadBotProjectFileSelector = selector({
  key: 'loadBotProjectFileSelector',
  get: ({ get }) => {
    const dispatcher = get(dispatcherState);
    if (!dispatcher) {
      return undefined;
    }
    return loadBotProjects(dispatcher);
  },
});
