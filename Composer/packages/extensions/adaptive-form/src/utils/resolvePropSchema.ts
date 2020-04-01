// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';

import { resolveRef } from './resolveRef';

export function resolvePropSchema(
  schema: JSONSchema7,
  path: string,
  definitions: {
    [k: string]: JSONSchema7Definition;
  } = {}
): JSONSchema7 | undefined {
  const propSchema = schema.properties?.[path];

  if (!propSchema || typeof propSchema !== 'object') {
    return;
  }

  return resolveRef(propSchema, definitions);
}
