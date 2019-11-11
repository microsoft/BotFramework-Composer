// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MicrosoftIDialog } from '../types';

import { copyAdaptiveAction } from './copyAdaptiveAction';
import { ExternalApi } from './ExternalApi';

export async function copyAdaptiveActionList(
  actions: MicrosoftIDialog[],
  externalApi: ExternalApi
): Promise<MicrosoftIDialog[]> {
  if (!Array.isArray(actions)) return [];

  const results: MicrosoftIDialog[] = [];
  for (const action of actions) {
    const copy = await copyAdaptiveAction(action, externalApi);
    results.push(copy);
  }
  return results;
}
