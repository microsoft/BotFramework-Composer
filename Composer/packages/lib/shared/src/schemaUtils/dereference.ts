// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SchemaDefinitions, DefinitionCache, JSONSchema7 } from '@bfc/types';

import { getRef } from './getRef';
import { CIRCULAR_REFS, isCircular } from './circular';

export function dereference<S extends JSONSchema7 | JSONSchema7[]>(
  schema: S,
  definitions: SchemaDefinitions,
  cache: DefinitionCache
): S extends JSONSchema7[] ? JSONSchema7[] : JSONSchema7 {
  if (Array.isArray(schema)) {
    const arraySchema: JSONSchema7[] = [];

    (schema as JSONSchema7[]).forEach((s) => {
      arraySchema.push(dereference(s, definitions, cache));
    });

    return arraySchema as never;
  } else if (typeof schema === 'object') {
    let newSchema: JSONSchema7 = {};

    Object.entries(schema).forEach(([key, value]) => {
      if (key === '$ref' && typeof value === 'string') {
        const def = !isCircular(value) && getRef(value, definitions, cache);

        if (def && typeof def === 'object') {
          newSchema = {
            ...def,
            ...newSchema,
          };
        } else {
          newSchema[key] = value;
        }
      } else if (typeof value === 'object' || Array.isArray(value)) {
        newSchema[key] = dereference(value, definitions, cache);
      } else {
        newSchema[key] = value;
      }
    });

    return newSchema as never;
  }

  return schema as never;
}

export function dereferenceDefinitions(definitions: SchemaDefinitions): SchemaDefinitions {
  const resolvedDefs: SchemaDefinitions = {};
  const cache: DefinitionCache = new Map();

  Object.entries(definitions).forEach(([key, value]) => {
    if (!CIRCULAR_REFS.includes(key)) {
      resolvedDefs[key] = dereference(value, definitions, cache);
    } else {
      resolvedDefs[key] = value;
    }
  });

  return resolvedDefs;
}
