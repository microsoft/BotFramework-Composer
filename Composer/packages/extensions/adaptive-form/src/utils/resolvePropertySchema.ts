// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';

import { resolveRef } from './resolveRef';

export function resolvePropSchema(
  schema: JSONSchema4,
  path: string,
  definitions: {
    [k: string]: JSONSchema4;
  } = {}
) {
  let propSchema = schema.properties;

  if (!propSchema) {
    return;
  }

  const pathParts = path.split('.');

  for (const part of pathParts) {
    propSchema = resolveRef((propSchema?.properties || propSchema)?.[part], definitions);
  }

  return propSchema;
}
