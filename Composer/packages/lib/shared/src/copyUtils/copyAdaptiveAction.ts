// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MicrosoftIDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import CopyConstructorMap from './CopyConstructorMap';

export async function copyAdaptiveAction(data: MicrosoftIDialog, externalApi: ExternalApi): Promise<MicrosoftIDialog> {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || !data.$type) return {};

  const copier = CopyConstructorMap[data.$type] || CopyConstructorMap.default;

  return await copier(data, externalApi);
}
