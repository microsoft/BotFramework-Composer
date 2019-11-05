// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const copyInputDialog = async (input: InputDialog, externalApi: ExternalApi): Promise<InputDialog> => {
  const copy: InputDialog = shallowCopyAdaptiveAction(input, externalApi) as InputDialog;

  if (input.prompt) {
    copy.prompt = await externalApi.copyLgTemplate(input.prompt);
  }

  if (input.unrecognizedPrompt) {
    copy.unrecognizedPrompt = await externalApi.copyLgTemplate(input.unrecognizedPrompt);
  }

  if (input.invalidPrompt) {
    copy.invalidPrompt = await externalApi.copyLgTemplate(input.invalidPrompt);
  }

  if (input.defaultValueResponse) {
    copy.defaultValue = await externalApi.copyLgTemplate(input.defaultValueResponse);
  }

  return copy;
};
