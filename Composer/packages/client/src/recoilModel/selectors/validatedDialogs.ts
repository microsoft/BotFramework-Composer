// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';
import { DialogInfo, BotSchemas, LgFile, DialogSetting, RecognizerFile, Diagnostic } from '@bfc/shared';
import { validateDialog } from '@bfc/indexers';

import { schemasState, dialogState, settingsState, localeState, lgFileState } from '../atoms';
import { getLuProvider } from '../../utils/dialogUtil';

import { recognizersSelectorFamily } from './recognizers';

type validateDialogSelectorFamilyParams = { projectId: string; dialogId: string };
export const dialogLuProviderSelectorFamily = selectorFamily({
  key: 'dialogLuProviderSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => ({ get }) => {
    const recognizers: RecognizerFile[] = get(recognizersSelectorFamily(projectId));
    return getLuProvider(dialogId, recognizers);
  },
});

export const dialogDiagnosticsSelectorFamily = selectorFamily({
  key: 'dialogDiagnosticsSelectorFamily',
  get: ({ projectId, dialogId }: validateDialogSelectorFamilyParams) => ({ get }) => {
    const dialog: DialogInfo = get(dialogState({ projectId, dialogId }));
    const schemas: BotSchemas = get(schemasState(projectId));
    const locale = get(localeState(projectId));
    const lgFile: LgFile = get(lgFileState({ projectId, lgFileId: `${dialogId}.${locale}` }));
    const settings: DialogSetting = get(settingsState(projectId));
    return validateDialog(dialog, schemas.sdk.content, settings, [lgFile], []) as Diagnostic[];
  },
});
