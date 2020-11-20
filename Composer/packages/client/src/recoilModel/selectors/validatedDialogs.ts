// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { validateDialog } from '@bfc/indexers';

import { botProjectIdsState, dialogIdsState, schemasState, lgFilesState, luFilesState, dialogState } from '../atoms';
import { getLuProvider } from '../../utils/dialogUtil';

import { recognizersSelectorFamily } from './recognizers';

type validateDialogSelectorFamilyParams = { projectId: string; dialogId: string };
const validateDialogSelectorFamily = selectorFamily({
  key: 'validateDialogSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => ({ get }) => {
    const dialog = get(dialogState({ projectId, dialogId }));
    const schemas = get(schemasState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const luFiles = get(luFilesState(projectId));
    const recognizers = get(recognizersSelectorFamily(projectId));
    const luProvider = getLuProvider(dialogId, recognizers);
    return { ...dialog, diagnostics: validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles), luProvider };
  },
});

export const validateDialogsSelectorFamily = selectorFamily({
  key: 'validateDialogsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const loadedProjects = get(botProjectIdsState);
    if (!loadedProjects.includes(projectId)) {
      return [];
    }
    const dialogIds = get(dialogIdsState(projectId));

    return dialogIds.map((dialogId) => {
      return get(validateDialogSelectorFamily({ projectId, dialogId }));
    });
  },
});
