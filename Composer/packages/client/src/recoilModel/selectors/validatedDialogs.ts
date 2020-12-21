// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { validateDialog } from '@bfc/indexers';
import { DialogInfo, BotSchemas, LgFile, LuFile, DialogSetting, RecognizerFile } from '@bfc/shared';

import {
  botProjectIdsState,
  dialogIdsState,
  schemasState,
  lgFilesState,
  luFilesState,
  dialogState,
  settingsState,
} from '../atoms';
import { getLuProvider } from '../../utils/dialogUtil';

import { recognizersSelectorFamily } from './recognizers';

type validateDialogSelectorFamilyParams = { projectId: string; dialogId: string };
const validateDialogSelectorFamily = selectorFamily({
  key: 'validateDialogSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => ({ get }) => {
    const dialog: DialogInfo = get(dialogState({ projectId, dialogId }));
    const schemas: BotSchemas = get(schemasState(projectId));
    const lgFiles: LgFile[] = get(lgFilesState(projectId));
    const luFiles: LuFile[] = get(luFilesState(projectId));
    const settings: DialogSetting = get(settingsState(projectId));
    const recognizers: RecognizerFile[] = get(recognizersSelectorFamily(projectId));
    const luProvider = getLuProvider(dialogId, recognizers);
    return {
      ...dialog,
      diagnostics: validateDialog(dialog, schemas.sdk.content, settings, lgFiles, luFiles),
      luProvider,
    };
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
