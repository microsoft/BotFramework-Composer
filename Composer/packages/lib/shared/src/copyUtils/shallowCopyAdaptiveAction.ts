// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '../types';

import { ExternalApi } from './ExternalApi';

export function shallowCopyAdaptiveAction(input: BaseSchema, externalApi: ExternalApi): BaseSchema {
  return {
    ...input,
    $designer: externalApi.getDesignerId(input.$designer),
  };
}
