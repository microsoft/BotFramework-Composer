// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copyInputDialog } from '../../src/copyUtils/copyInputDialog';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  const externalApiWithLgCopy: ExternalApi = {
    ...externalApi,
    copyLgField: (fromId, fromData, toId, toData, fieldName) => Promise.resolve(fromData[fieldName] + '(copy)'),
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
      prompt: '[TextInput_Prompt_1234]',
      invalidPrompt: '[TextInput_InvalidPrompt_1234]',
      unrecognizedPrompt: '[TextInput_UnrecognizedPrompt_1234]',
      defaultValueResponse: '[TextInput_DefaultValueResponse_1234]',
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
      prompt: '[TextInput_Prompt_1234](copy)',
      invalidPrompt: '[TextInput_InvalidPrompt_1234](copy)',
      unrecognizedPrompt: '[TextInput_UnrecognizedPrompt_1234](copy)',
      defaultValueResponse: '[TextInput_DefaultValueResponse_1234](copy)',
    });
  });
});
