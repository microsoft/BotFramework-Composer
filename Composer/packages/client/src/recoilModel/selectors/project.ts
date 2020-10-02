// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';
import isEmpty from 'lodash/isEmpty';

import {
  botErrorState,
  botDisplayNameState,
  botProjectFileState,
  botProjectIdsState,
  dialogsState,
  projectMetaDataState,
  botNameIdentifierState,
} from '../atoms';

// Actions
export const botsForFilePersistenceSelector = selector({
  key: 'botsForFilePersistenceSelector',
  get: ({ get }) => {
    const botProjectIds = get(botProjectIdsState);
    return botProjectIds.filter((projectId: string) => {
      const { isRemote } = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      return !botError && !isRemote;
    });
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
      const name = get(botDisplayNameState(projectId));
      const botNameId = get(botNameIdentifierState(projectId));
      return { dialogs, projectId, name, ...metaData, error: botError, botNameId };
    });
    console.log(result);
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
