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
    };
  },
});
