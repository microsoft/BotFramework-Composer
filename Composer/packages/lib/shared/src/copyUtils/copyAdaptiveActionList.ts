// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyAdaptiveAction } from './copyAdaptiveAction';
import { ExternalApi } from './ExternalApi';

export async function copyAdaptiveActionList(actions, externalApi: ExternalApi): Promise<any[]> {
  if (!Array.isArray(actions)) return [];

  const results: any[] = [];
  for (const action of actions) {
    const copy = await copyAdaptiveAction(action, externalApi);
    results.push(copy);
  }
  return results;
}
