// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IfCondition } from '../types';

import { ExternalApi } from './ExternalApi';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';

export const copyIfCondition = async (input: IfCondition, externalApi: ExternalApi): Promise<IfCondition> => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = await copyAdaptiveActionList(input.actions, externalApi);
  }

  if (Array.isArray(input.elseActions)) {
    copy.elseActions = await copyAdaptiveActionList(input.elseActions, externalApi);
  }

  return copy;
};
