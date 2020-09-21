// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { botNameState, botProjectSpaceProjectIds, dialogsState } from '../atoms';

//TODO: This selector will be used when BotProjects is implemented
export const botProjectSpaceSelector = selector({
  key: 'botProjectSpaceSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectSpaceProjectIds);
    const result = botProjects.map((botProjectId: string) => {
      const dialogs = get(dialogsState(botProjectId));
      const name = get(botNameState(botProjectId));
      const projectId = botProjectId;
      return { dialogs, projectId, name };
    });
    return result;
  },
});
