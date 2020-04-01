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
  if (!schema.properties) {
    return;
  }

  const pathParts = path.split('.');
  let propSchema: JSONSchema7 = schema.properties;

  for (const part of pathParts) {
    propSchema = resolveRef(propSchema?.[part], definitions);
  }

  return propSchema;
}
