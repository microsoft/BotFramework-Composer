// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SendActivity } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const copySendActivity = async (input: SendActivity, externalApi: ExternalApi): Promise<SendActivity> => {
  const copy: SendActivity = shallowCopyAdaptiveAction(input, externalApi);

  if (input.activity) {
    copy.activity = await externalApi.copyLgTemplate(input.activity);
  }

  return copy;
};
