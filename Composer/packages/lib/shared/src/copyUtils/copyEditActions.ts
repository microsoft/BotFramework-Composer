// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditActions } from '@botframework-composer/types';

import { ExternalApi } from './ExternalApi';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyAdaptiveActionList } from './copyAdaptiveActionList';

export async function copyEditActions(input: EditActions, externalApi: ExternalApi): Promise<EditActions> {
  const copy = shallowCopyAdaptiveAction(input, externalApi);

  if (Array.isArray(input.actions)) {
    copy.actions = await copyAdaptiveActionList(input.actions, externalApi);
  }

  return copy;
}
