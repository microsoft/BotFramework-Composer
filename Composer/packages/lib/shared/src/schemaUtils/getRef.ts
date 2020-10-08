// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import formatMessage from 'format-message';
import { SchemaDefinitions, DefinitionCache, JSONSchema7 } from '@bfc/types';

import { isCircular } from './circular';
import { dereference } from './dereference';

export function getRef(ref: string, definitions: SchemaDefinitions, cache: DefinitionCache): JSONSchema7 {
  const defName = ref.replace('#/definitions/', '');

  if (cache.has(defName)) {
    return cache.get(defName) as JSONSchema7;
  }

  let def = get(definitions, defName.split('/')) as JSONSchema7 | undefined;

  if (!def) {
    throw new Error(formatMessage('Definition not found for {defName}', { defName }));
  }

  if (!isCircular(defName)) {
    def = dereference(def, definitions, cache);
  }
  cache.set(defName, def);

  return def;
}
