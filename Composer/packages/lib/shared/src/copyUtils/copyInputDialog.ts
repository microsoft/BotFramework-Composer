// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyInputDialog = async (input: InputDialog, externalApi: ExternalApi): Promise<InputDialog> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';
  const copyLgField = (data, fieldName: string) => externalApi.copyLgTemplate(nodeId, data, fieldName, data[fieldName]);

  if (input.prompt !== undefined) {
    copy.prompt = await copyLgField(copy, 'prompt');
  }

  if (input.unrecognizedPrompt !== undefined) {
    copy.unrecognizedPrompt = await copyLgField(copy, 'unrecognizedPrompt');
  }

  if (input.invalidPrompt !== undefined) {
    copy.invalidPrompt = await copyLgField(copy, 'invalidPrompt');
  }

  if (input.defaultValueResponse !== undefined) {
    copy.defaultValueResponse = await copyLgField(copy, 'defaultValueResponse');
  }

  return copy;
};
