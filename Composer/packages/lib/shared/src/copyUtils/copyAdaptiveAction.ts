// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MicrosoftIDialog } from '../types';

import { ExternalApi } from './ExternalApi';
import CopyConstructorMap from './CopyConstructorMap';

export function copyAdaptiveAction(data: MicrosoftIDialog, externalApi: ExternalApi): MicrosoftIDialog {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || !data.$kind) return {};

  const copier = CopyConstructorMap[data.$kind] || CopyConstructorMap.default;

  return copier(data, externalApi);
}
