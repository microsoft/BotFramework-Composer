// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, SchemaDefinitions } from '@bfc/extension-client';

import { resolveRef } from './resolveRef';

export function resolvePropSchema(
  schema: JSONSchema7,
  path: string,
  definitions: SchemaDefinitions = {}
): JSONSchema7 | undefined {
  const propSchema = schema.properties?.[path];

  if (!propSchema || typeof propSchema !== 'object') {
    return;
  }

  return resolveRef(propSchema, definitions);
}
