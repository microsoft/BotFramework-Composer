// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { DialogInfo, BotSchemas, LgFile, DialogSetting, RecognizerFile } from '@bfc/shared';
import { validateDialog } from '@bfc/indexers';

import { schemasState, dialogState, settingsState, localeState, lgFileState, projectMetaDataState } from '../atoms';
import { getLuProvider } from '../../utils/dialogUtil';

import { recognizersSelectorFamily } from './recognizers';
import { dialogsSelectorFamily } from './dialogs';
import { ClientStorage } from './../../utils/storage';
const dialogCache = new ClientStorage(window.sessionStorage, 'dialogCache');

type validateDialogSelectorFamilyParams = { projectId: string; dialogId: string };
export const dialogsWithLuProviderSelectorFamily = selectorFamily({
  key: 'dialogLuProviderSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(dialogsSelectorFamily(projectId));
    const recognizers: RecognizerFile[] = get(recognizersSelectorFamily(projectId));
    return dialogs.map((dialog) => {
      return {
        ...dialog,
        luProvider: getLuProvider(dialog.id, recognizers),
      };
    });
  },
});

export const dialogDiagnosticsSelectorFamily = selectorFamily({
  key: 'dialogDiagnosticsSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => ({ get }) => {
    if (get(projectMetaDataState(projectId)).isRemote) return [];

    const dialog: DialogInfo = get(dialogState({ projectId, dialogId }));
    const schemas: BotSchemas = get(schemasState(projectId));
    const locale = get(localeState(projectId));
    const lgFile: LgFile = get(lgFileState({ projectId, lgFileId: `${dialogId}.${locale}` }));
    const settings: DialogSetting = get(settingsState(projectId));
    const cacheId = `${projectId}-${dialogId}`;

    const { diagnostics, cache } = validateDialog(
      dialog,
      schemas.sdk.content,
      settings,
      [lgFile],
      [],
      dialogCache.get(cacheId)
    );
    dialogCache.set(cacheId, cache);

    return diagnostics;
  },
});
