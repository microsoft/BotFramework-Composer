// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copyInputDialog } from '../../src/copyUtils/copyInputDialog';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';

import { externalApiStub as externalApi } from './externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  const externalApiWithLgCopy: ExternalApi = {
    ...externalApi,
    copyLgTemplate: (templateName, newNodeId) => Promise.resolve(templateName + '(copy)'),
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

    expect(await copyInputDialog(promptText as any, externalApiWithLgCopy)).toEqual({
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
