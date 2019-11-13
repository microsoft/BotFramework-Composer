// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyInputDialog = async (input: InputDialog, externalApi: ExternalApi): Promise<InputDialog> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';

  if (input.prompt) {
    copy.prompt = await externalApi.copyLgTemplate(nodeId, input.prompt);
  }

  if (input.unrecognizedPrompt) {
    copy.unrecognizedPrompt = await externalApi.copyLgTemplate(nodeId, input.unrecognizedPrompt);
  }

  if (input.invalidPrompt) {
    copy.invalidPrompt = await externalApi.copyLgTemplate(nodeId, input.invalidPrompt);
  }

  if (input.defaultValueResponse) {
    copy.defaultValue = await externalApi.copyLgTemplate(nodeId, input.defaultValueResponse);
  }

  return copy;
};
