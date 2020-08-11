// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Foreach, ForeachPage } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';

type ForeachAction = Foreach | ForeachPage;
export const copyForeach = (input: ForeachAction, externalApi: ExternalApi): ForeachAction => {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = copyAdaptiveActionList(input.actions, externalApi);
  }

  return copy;
};
