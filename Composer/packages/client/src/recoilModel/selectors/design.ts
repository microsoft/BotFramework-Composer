// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, selectorFamily } from 'recoil';

import { botNameState, botProjectsSpaceState, filePersistenceState } from '../atoms';

export const filePersistenceSelector = selectorFamily({
  key: 'filePersistenceSelector',
  get: (projectId: string) => ({ get }) => {
    return get(filePersistenceState(projectId));
  },
});

//TODO: This selector will be used
export const botProjectSpaceSelector = selector({
  key: 'botProjectSpaceSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectsSpaceState);
    const result = botProjects.map((botProjectId: string) => {
      const name = get(botNameState(botProjectId));
      return { projectId: botProjectId, name };
    });
    return result;
  },
});

export const botProjectSpaceTreeSelector = selector({
  key: 'botProjectSpaceTreeSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectsSpaceState);
    const result = botProjects.map((botProjectId: string) => {
      const dialogs = get(dialogsState(botProjectId));
      const name = get(botNameState(botProjectId));
      const projectId = botProjectId;
      return { dialogs, projectId, name };
    });
    return result;
  },
});
