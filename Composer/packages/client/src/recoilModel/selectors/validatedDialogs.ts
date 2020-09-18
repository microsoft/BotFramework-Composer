// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { validateDialog } from '@bfc/indexers';

import { dialogsState, schemasState, lgFilesState, luFilesState } from '../atoms/botState';

export const validateDialogSelectorFamily = selectorFamily({
  key: 'validateDialogSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(dialogsState(projectId));
    const schemas = get(schemasState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const luFiles = get(luFilesState(projectId));
    return dialogs.map((dialog) => {
      return { ...dialog, diagnostics: validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles) };
    });
  },
});
