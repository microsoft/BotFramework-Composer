// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditActions } from '@bfc/types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';

export const copyEditActions = async (input: EditActions, externalApi: ExternalApi): Promise<EditActions> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = await copyAdaptiveActionList(input.actions, externalApi);
  }

  return copy;
};
