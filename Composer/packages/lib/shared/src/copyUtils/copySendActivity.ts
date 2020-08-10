// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SendActivity } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copySendActivity = (input: SendActivity, externalApi: ExternalApi): SendActivity => {
  const inputActionId = input.$designer?.id || '';
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';

  if (input.activity !== undefined) {
    copy.activity = externalApi.copyLgField(inputActionId, input, nodeId, copy, 'activity');
  }

  return copy;
};
