// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from 'json-schema';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { resolveRef } from './resolveRef';

export function resolveBaseSchema(schema: JSONSchema7, data: MicrosoftAdaptiveDialog): JSONSchema7 | undefined {
  const defSchema = schema.definitions?.[data.$kind];
  if (defSchema && typeof defSchema === 'object') {
    return resolveRef(defSchema, schema.definitions);
  }
}
