// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditActions } from '../types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';

export const copyEditActions = async (input: EditActions, externalApi: ExternalApi): Promise<EditActions> => {
  const copy: EditActions = shallowCopyAdaptiveAction(input, externalApi) as EditActions;

  if (Array.isArray(input.actions)) {
    copy.actions = await copyAdaptiveActionList(input.actions, externalApi);
  }

  return copy;
};
