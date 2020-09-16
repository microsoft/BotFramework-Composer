// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { botNameState, botProjectsSpaceState } from '../atoms';

//TODO: This selector will be used when BotProjects is implemented
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
