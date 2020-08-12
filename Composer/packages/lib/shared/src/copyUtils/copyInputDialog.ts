// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InputDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyInputDialog = (input: InputDialog, externalApi: ExternalApi): InputDialog => {
  const inputActionId = input.$designer?.id || '';

  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const copiedActionId = copy.$designer ? copy.$designer.id : '';

  const copyLg = (toAction, fieldName: string) =>
    externalApi.copyLgField(inputActionId, input, copiedActionId, toAction, fieldName);

  if (input.prompt !== undefined) {
    copy.prompt = copyLg(copy, 'prompt');
  }

  if (input.unrecognizedPrompt !== undefined) {
    copy.unrecognizedPrompt = copyLg(copy, 'unrecognizedPrompt');
  }

  if (input.invalidPrompt !== undefined) {
    copy.invalidPrompt = copyLg(copy, 'invalidPrompt');
  }

  if (input.defaultValueResponse !== undefined) {
    copy.defaultValueResponse = copyLg(copy, 'defaultValueResponse');
  }

  externalApi.copyLuField(inputActionId, input, copiedActionId, copy, '');

  return copy;
};
