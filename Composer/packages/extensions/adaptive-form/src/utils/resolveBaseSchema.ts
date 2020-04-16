// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from 'json-schema';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { resolveRef } from './resolveRef';

export function resolveBaseSchema(schema: JSONSchema7, data: MicrosoftAdaptiveDialog): JSONSchema7 | undefined {
  const kindDef = schema.definitions?.[data.$kind];
  if (typeof kindDef === 'object') {
    return resolveRef(kindDef, schema.definitions);
  }
}
