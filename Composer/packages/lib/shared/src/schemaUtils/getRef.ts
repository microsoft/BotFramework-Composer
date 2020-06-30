// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { JSONSchema7Definition } from 'json-schema';
import formatMessage from 'format-message';

import { SchemaDefinitions, DefinitionCache } from './types';
import { isCircular } from './circular';
import { dereference } from './dereference';

export function getRef(ref: string, definitions: SchemaDefinitions, cache: DefinitionCache): JSONSchema7Definition {
  const defName = ref.replace('#/definitions/', '');

  if (cache.has(defName)) {
    return cache.get(defName) as JSONSchema7Definition;
  }

  let def = get(definitions, defName.split('/')) as JSONSchema7Definition | undefined;

  if (!def) {
    throw new Error(formatMessage('Definition not found for {defName}', { defName }));
  }

  if (!isCircular(defName)) {
    def = dereference(def as JSONSchema7Definition, definitions, cache);
  }
  cache.set(defName, def);

  return def;
}
