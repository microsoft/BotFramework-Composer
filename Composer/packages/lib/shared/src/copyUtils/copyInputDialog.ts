// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyInputDialog = async (input: InputDialog, externalApi: ExternalApi): Promise<InputDialog> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';

  if (input.prompt) {
    copy.prompt = await externalApi.copyLgTemplate(input.prompt, nodeId);
  }

  if (input.unrecognizedPrompt) {
    copy.unrecognizedPrompt = await externalApi.copyLgTemplate(input.unrecognizedPrompt, nodeId);
  }

  if (input.invalidPrompt) {
    copy.invalidPrompt = await externalApi.copyLgTemplate(input.invalidPrompt, nodeId);
  }

  if (input.defaultValueResponse) {
    copy.defaultValueResponse = await externalApi.copyLgTemplate(input.defaultValueResponse, nodeId);
  }

  return copy;
};
