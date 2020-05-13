// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import get from 'lodash/get';
import memoize from 'lodash/memoize';

type SchemaDefinitions = {
  [key: string]: JSONSchema7Definition;
};

const CIRCULAR_REFS = [
  'Microsoft.IDialog',
  'Microsoft.IRecognizer',
  'Microsoft.ILanguageGenerator',
  'Microsoft.ITriggerSelector',
  'Microsoft.AdaptiveDialog',
];

const definitionCache = new Map();

const isCircular = memoize((def: string) => CIRCULAR_REFS.some(kind => def.includes(kind)));

function getRef(ref: string, definitions: SchemaDefinitions) {
  const defName = ref.replace('#/definitions/', '');
  let def = definitionCache.get(defName) || get(definitions, defName.split('/'));

  if (!def) {
    throw new Error(`Definition not found for ${defName}`);
  }

  if (!isCircular(defName)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    def = dereference(def, definitions);
  }
  definitionCache.set(defName, def);

  return def;
}

export function dereference<S extends JSONSchema7 | JSONSchema7[] | JSONSchema7Definition>(
  schema: S,
  definitions: SchemaDefinitions
): S extends JSONSchema7[] ? JSONSchema7[] : S extends JSONSchema7 ? JSONSchema7 : JSONSchema7Definition {
  // properties, oneOf, allOf, anyOf, items, additionalProperties
  if (Array.isArray(schema)) {
    const arraySchema: JSONSchema7[] = [];

    (schema as JSONSchema7[]).forEach(s => {
      arraySchema.push(dereference(s, definitions));
    });

    return arraySchema as never;
  } else if (typeof schema === 'object') {
    let newSchema: JSONSchema7 = {};

    Object.entries(schema).forEach(([key, value]) => {
      if (key === '$ref' && typeof value === 'string') {
        const def = getRef(value, definitions);

        if (def) {
          newSchema = {
            ...def,
            ...newSchema,
          };
        }
      } else if (typeof value === 'object' || Array.isArray(value)) {
        newSchema[key] = dereference(value, definitions);
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

  Object.entries(definitions).forEach(([key, value]) => {
    if (!CIRCULAR_REFS.includes(key)) {
      resolvedDefs[key] = dereference(value, definitions);
    } else {
      resolvedDefs[key] = value;
    }
  });

  return resolvedDefs;
}
