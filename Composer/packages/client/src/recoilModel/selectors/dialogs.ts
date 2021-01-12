// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo } from '@bfc/shared';
import { selectorFamily } from 'recoil';

import { dialogIdsState, dialogState } from '../atoms';

export const dialogsSelectorFamily = selectorFamily<DialogInfo[], string>({
  key: 'dialogs',
  get: (projectId: string) => ({ get }) => {
    const dialogIds = get(dialogIdsState(projectId));

    return dialogIds.map((dialogId) => {
      return get(dialogState({ projectId, dialogId }));
    });
  },
  set: (projectId: string) => ({ set }, newDialogs) => {
    const newDialogArray = newDialogs as DialogInfo[];

    set(
      dialogIdsState(projectId),
      newDialogArray.map((dialog) => dialog.id)
    );
    newDialogArray.forEach((dialog) => set(dialogState({ projectId, dialogId: dialog.id }), dialog));
  },
});
