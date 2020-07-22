// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';

import { dialogsNewState } from '../atoms';

export const designViewQuerySelector = selectorFamily({
  key: 'designViewSelector',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(dialogsNewState(projectId));
    return {
      dialogs,
    };
  },
});
