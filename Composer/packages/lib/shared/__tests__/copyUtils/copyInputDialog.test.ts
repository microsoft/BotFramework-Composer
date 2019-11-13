// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { copyInputDialog } from '../../src/copyUtils/copyInputDialog';

describe('shallowCopyAdaptiveAction', () => {
  const externalApi: ExternalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: (id, x) => Promise.resolve(x + '(copy)'),
  };

  it('can copy TextInput', async () => {
    const promptText = {
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '844184',
        name: 'Prompt for text',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-1234]',
      invalidPrompt: '[bfdinvalidPrompt-1234]',
    };

    expect(await copyInputDialog(promptText as any, externalApi)).toEqual({
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '5678',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-1234](copy)',
      invalidPrompt: '[bfdinvalidPrompt-1234](copy)',
    });
  });
});
