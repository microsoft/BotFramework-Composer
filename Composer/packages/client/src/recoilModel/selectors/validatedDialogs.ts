// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';
import { validateDialog } from '@bfc/indexers';

import { dialogsState, schemasState, lgFilesState, luFilesState } from '../atoms/botState';

export const validatedDialogsSelector = selector({
  key: 'validatedDialogsSelector',
  get: ({ get }) => {
    const dialogs = get(dialogsState);
    const schemas = get(schemasState);
    const lgFiles = get(lgFilesState);
    const luFiles = get(luFilesState);
    return dialogs.map((dialog) => {
      return { ...dialog, diagnostics: validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles) };
    });
  },
});
