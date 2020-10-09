// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '@bfc/types';

import { ExternalApi } from './ExternalApi';

export function shallowCopyAdaptiveAction<T extends BaseSchema>(input: T, externalApi: ExternalApi): T {
  return {
    ...input,
    $designer: externalApi.getDesignerId(input.$designer),
  };
}
