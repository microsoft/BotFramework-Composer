// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { selectorFamily } from 'recoil';

import { canRedoState, canUndoState } from '../atoms/botState';

export const undoStatusSelectorFamily = selectorFamily<[boolean, boolean], string>({
  key: 'undoStatus',
  get: (projectId: string) => ({ get }) => {
    const canUndo = get(canUndoState(projectId));
    const canRedo = get(canRedoState(projectId));
    return [canUndo, canRedo];
  },
});
