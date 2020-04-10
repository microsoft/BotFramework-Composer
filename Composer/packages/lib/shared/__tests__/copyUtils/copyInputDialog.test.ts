// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copyInputDialog } from '../../src/copyUtils/copyInputDialog';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  const externalApiWithLgCopy: ExternalApi = {
    ...externalApi,
    transformLgField: (id, data, field, value) => Promise.resolve(value + '(copy)'),
  };

  it('can copy TextInput', async () => {
    const promptText = {
      $kind: 'Microsoft.TextInput',
      $designer: {
        id: '844184',
        name: 'Prompt for text',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt_1234]',
      invalidPrompt: '[bfdinvalidPrompt_1234]',
      unrecognizedPrompt: '[bfdunrecognizedPrompt_1234]',
      defaultValueResponse: '[bfddefaultValueResponse_1234]',
    };

    expect(await copyInputDialog(promptText as any, externalApiWithLgCopy)).toEqual({
      $kind: 'Microsoft.TextInput',
      $designer: {
        id: '5678',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt_1234](copy)',
      invalidPrompt: '[bfdinvalidPrompt_1234](copy)',
      unrecognizedPrompt: '[bfdunrecognizedPrompt_1234](copy)',
      defaultValueResponse: '[bfddefaultValueResponse_1234](copy)',
    });
  });
});
