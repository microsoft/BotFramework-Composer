// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';
import isEmpty from 'lodash/isEmpty';

import {
  botErrorState,
  botNameState,
  botProjectFileState,
  botProjectIdsState,
  dialogsState,
  projectMetaDataState,
} from '../atoms';

// Actions
export const botProjectsWithoutErrorsSelector = selector({
  key: 'botProjectsWithoutErrorsSelector',
  get: ({ get }) => {
    const botProjectIds = get(botProjectIdsState);
    const projectsWithoutErrors = botProjectIds
      .filter((projectId) => !get(botErrorState(projectId)))
      .map((projectId: string) => {
        const metaData = get(projectMetaDataState(projectId));
        return {
          projectId,
          ...metaData,
        };
      });
    return projectsWithoutErrors;
  },
});

export const botProjectSpaceSelector = selector({
  key: 'botProjectSpaceSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectIdsState);
    const result = botProjects.map((projectId: string) => {
      const dialogs = get(dialogsState(projectId));
      const metaData = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      const name = get(botNameState(projectId));
      return { dialogs, projectId, name, ...metaData, error: botError };
    });
    return result;
  },
});

export const isBotProjectSpaceSelector = selector({
  key: 'isBotProjectSpaceSelector',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    const rootBotId = projectIds[0];
    const metaData = get(projectMetaDataState(rootBotId));
    const botProjectFile = get(botProjectFileState(rootBotId));
    return metaData.isRootBot && !isEmpty(botProjectFile);
  },
});

export const rootBotProjectIdSelector = selector({
  key: 'rootBotProjectIdSelector',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    const rootBotId = projectIds[0];
    const metaData = get(projectMetaDataState(rootBotId));
    if (metaData.isRootBot) {
      return rootBotId;
    }
  },
});
