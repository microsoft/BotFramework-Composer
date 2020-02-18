// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { resolveRef } from './resolveRef';

export function resolveBaseSchema(schema: JSONSchema4, data: MicrosoftAdaptiveDialog) {
  if (schema.definitions && schema.definitions?.[data.$type]) {
    return resolveRef(schema.definitions?.[data.$type], schema.definitions);
  }
}
