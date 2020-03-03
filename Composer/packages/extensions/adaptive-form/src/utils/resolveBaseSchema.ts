// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from 'json-schema';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { resolveRef } from './resolveRef';

export function resolveBaseSchema(schema: JSONSchema7, data: MicrosoftAdaptiveDialog): JSONSchema7 | undefined {
  if (schema.definitions && schema.definitions?.[data.$type] && schema.definitions?.[data.$type] !== true) {
    return resolveRef(schema.definitions?.[data.$type], schema.definitions);
  }
}
