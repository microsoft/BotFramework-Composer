// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditActions } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';

export const copyEditActions = (input: EditActions, externalApi: ExternalApi): EditActions => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = copyAdaptiveActionList(input.actions, externalApi);
  }

  return copy;
};
