// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, selectorFamily } from 'recoil';

import { botProjectsState, dialogsNewState } from '../atoms';

export const designViewSelector = selector({
  key: 'designViewSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectsState);
    const aggregatedView: any = [];
    botProjects.forEach((botProject) => {
      const dialogs = get(dialogsNewState(botProject.projectId));
      aggregatedView.push({
        dialogs,
      });
    });
    return aggregatedView;
  },
});

export const designViewQuery = selectorFamily({
  key: 'designViewSelector',
  get: (projectId) => async () => {
    const dialogs = get(dialogsNewState(projectId));
    return {
      dialogs,
    };
  },
});
