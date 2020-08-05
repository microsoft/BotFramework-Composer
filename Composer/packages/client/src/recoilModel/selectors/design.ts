// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

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
  designPageLocationState,
  breadcrumbState,
  showCreateDialogModalState,
  showAddSkillDialogModalState,
  settingsState,
  publishVersionsState,
  publishStatusState,
  lastPublishChangeState,
  publishTypesState,
  botOpeningState,
  publishHistoryState,
  onCreateDialogCompleteState,
  focusPathState,
  onAddSkillDialogCompleteState,
  displaySkillManifestState,
  showAddLanguageModalState,
  showDelLanguageModalState,
  onAddLanguageDialogCompleteState,
  onDelLanguageDialogCompleteState,
} from '../atoms';

export const botStateByProjectIdSelector = selector({
  key: 'botStateByProjectIdSelector',
  get: ({ get }) => {
    const projectId = get(currentProjectIdState);
    const dialogs = get(dialogsState(projectId));
    const schemas = get(schemasState(projectId));
    const botName = get(schemasState(projectId));
    const location = get(locationState(projectId));
    const botStatus = get(botStatusState(projectId));
    const botDiagnostics = get(botDiagnosticsState(projectId));
    const botEnvironment = get(botEnvironmentState(projectId));
    const locale = get(localeState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const luFiles = get(luFilesState(projectId));
    const skills = get(skillsState(projectId));
    const botLoadError = get(botLoadErrorState(projectId));
    const actionsSeed = get(actionsSeedState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const designPageLocation = get(designPageLocationState(projectId));
    const breadcrumb = get(breadcrumbState(projectId));
    const showCreateDialogModal = get(showCreateDialogModalState(projectId));
    const showAddSkillDialogModal = get(showAddSkillDialogModalState(projectId));
    const settings = get(settingsState(projectId));
    const publishVersions = get(publishVersionsState(projectId));
    const publishStatus = get(publishStatusState(projectId));
    const lastPublishChange = get(lastPublishChangeState(projectId));
    const publishTypes = get(publishTypesState(projectId));
    const botOpening = get(botOpeningState(projectId));
    const publishHistory = get(publishHistoryState(projectId));
    const onCreateDialogComplete = get(onCreateDialogCompleteState(projectId));
    const focusPath = get(focusPathState(projectId));
    const onAddSkillDialogComplete = get(onAddSkillDialogCompleteState(projectId));
    const displaySkillManifest = get(displaySkillManifestState(projectId));
    const showAddLanguageModal = get(showAddLanguageModalState(projectId));
    const showDelLanguageModal = get(showDelLanguageModalState(projectId));
    const onAddLanguageDialogComplete = get(onAddLanguageDialogCompleteState(projectId));
    const onDelLanguageDialogComplete = get(onDelLanguageDialogCompleteState(projectId));

    return {
      dialogs,
      schemas,
      botName,
      location,
      botStatus,
      botDiagnostics,
      botEnvironment,
      locale,
      luFiles,
      lgFiles,
      skills,
      botLoadError,
      actionsSeed,
      skillManifests,
      designPageLocation,
      breadcrumb,
      showCreateDialogModal,
      showAddSkillDialogModal,
      settings,
      publishVersions,
      publishStatus,
      lastPublishChange,
      publishTypes,
      botOpening,
      publishHistory,
      onCreateDialogComplete,
      focusPath,
      onAddSkillDialogComplete,
      displaySkillManifest,
      showAddLanguageModal,
      showDelLanguageModal,
      onAddLanguageDialogComplete,
      onDelLanguageDialogComplete,
    };
  },
});
