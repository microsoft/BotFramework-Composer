// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IfCondition } from '../types';

import { ExternalApi } from './ExternalApi';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyIfCondition = (input: IfCondition, externalApi: ExternalApi): IfCondition => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = copyAdaptiveActionList(input.actions, externalApi);
  }

  if (Array.isArray(input.elseActions)) {
    copy.elseActions = copyAdaptiveActionList(input.elseActions, externalApi);
  }

  return copy;
};
