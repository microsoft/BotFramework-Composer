// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo } from '../../../../../types';

export const mockDialog: (id: string) => DialogInfo = (id: string) => ({
  isRoot: true,
  displayName: id,
  id,
  isFormDialog: false,
  content: {
    $kind: 'Microsoft.AdaptiveDialog',
    $designer: { id: '433224', description: id, name: id },
    autoEndDialog: true,
    defaultResultProperty: 'dialog.result',
    triggers: [],
    generator: '',
    $schema:
      'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema',
    id,
    recognizer: '',
  },
  diagnostics: [],
  referredDialogs: [],
  lgTemplates: [],
  referredLuIntents: [],
  luFile: id,
  qnaFile: id,
  lgFile: id,
  triggers: [],
  intentTriggers: [],
  skills: [],
});
