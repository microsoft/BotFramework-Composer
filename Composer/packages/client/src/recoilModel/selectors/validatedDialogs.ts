// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { DialogInfo, BotSchemas, LgFile, LuFile, DialogSetting, RecognizerFile, Diagnostic } from '@bfc/shared';

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
import validateWorker from './../parsers/validateWorker';

type validateDialogSelectorFamilyParams = { projectId: string; dialogId: string };
const validateDialogSelectorFamily = selectorFamily({
  key: 'validateDialogSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => async ({ get }) => {
    const dialog: DialogInfo = get(dialogState({ projectId, dialogId }));
    const schemas: BotSchemas = get(schemasState(projectId));
    const lgFiles: LgFile[] = get(lgFilesState(projectId));
    const luFiles: LuFile[] = get(luFilesState(projectId));
    const settings: DialogSetting = get(settingsState(projectId));
    const recognizers: RecognizerFile[] = get(recognizersSelectorFamily(projectId));
    const luProvider = getLuProvider(dialogId, recognizers);
    return {
      ...dialog,
      diagnostics: (await validateWorker.validateDialog({
        dialog,
        schema: schemas.sdk.content,
        settings,
        lgFiles,
        luFiles,
      })) as Diagnostic[],
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
