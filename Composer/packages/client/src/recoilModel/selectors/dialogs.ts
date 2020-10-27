// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo } from '@bfc/shared';
import { selectorFamily, selector } from 'recoil';

import { dialogIdsState, dialogState, botProjectIdsState } from '../atoms';

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

export const projectDialogsSelectorFamily = selector<{ [key: string]: DialogInfo[] }>({
  key: 'projectDialogs',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    const projectDialogsMap = {};

    projectIds.map((projectId) => {
      const dialogIds = get(dialogIdsState(projectId));
      projectDialogsMap[projectId] = dialogIds.map((dialogId) => {
        return get(dialogState({ projectId, dialogId }));
      });
    });

    return projectDialogsMap;
  },
});
