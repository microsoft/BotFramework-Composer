// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SendActivity } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copySendActivity = async (input: SendActivity, externalApi: ExternalApi): Promise<SendActivity> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);
  const nodeId = copy.$designer ? copy.$designer.id : '';

  if (input.activity !== undefined) {
    copy.activity = await externalApi.transformLgField(nodeId, copy, 'activity', copy.activity);
  }

  return copy;
};
