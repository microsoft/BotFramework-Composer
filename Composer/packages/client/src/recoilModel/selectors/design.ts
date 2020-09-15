// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, selectorFamily } from 'recoil';

import { botNameState, botProjectsSpaceState, filePersistenceState, dialogsState } from '../atoms';

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
