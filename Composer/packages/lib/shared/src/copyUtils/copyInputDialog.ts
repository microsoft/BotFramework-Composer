// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyInputDialog = async (input: InputDialog, externalApi: ExternalApi): Promise<InputDialog> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';
  const transformLg = (data, fieldName: string) =>
    externalApi.transformLgField(nodeId, data, fieldName, data[fieldName]);

  if (input.prompt !== undefined) {
    copy.prompt = await transformLg(copy, 'prompt');
  }

  if (input.unrecognizedPrompt !== undefined) {
    copy.unrecognizedPrompt = await transformLg(copy, 'unrecognizedPrompt');
  }

  if (input.invalidPrompt !== undefined) {
    copy.invalidPrompt = await transformLg(copy, 'invalidPrompt');
  }

  if (input.defaultValueResponse !== undefined) {
    copy.defaultValueResponse = await transformLg(copy, 'defaultValueResponse');
  }

  await externalApi.transformLuField(nodeId, copy, '_lu', undefined);

  return copy;
};
