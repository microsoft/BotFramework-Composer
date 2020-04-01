// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from 'json-schema';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { resolveRef } from './resolveRef';

export function resolveBaseSchema(schema: JSONSchema7, data: MicrosoftAdaptiveDialog): JSONSchema7 | undefined {
  if (schema.definitions && schema.definitions?.[data.$kind] && schema.definitions?.[data.$kind] !== true) {
    return resolveRef(schema.definitions?.[data.$kind], schema.definitions);
  }
}
