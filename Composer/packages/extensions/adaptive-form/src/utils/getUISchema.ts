// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import memoize from 'lodash/memoize';

import { mergeUISchema } from './mergeUISchema';

const mergeSchemas = process.env.NODE_ENV === 'production' ? memoize(mergeUISchema) : mergeUISchema;

/**
 * Merges overrides into default ui schema and returns the UIOptions
 */
export function getUISchema($type: SDKTypes, ...overrides: UISchema[]): UIOptions {
  const mergedSchema = mergeSchemas(...overrides);

  const typeSchema = mergedSchema[$type];

  if (!typeSchema) {
    return {};
  }

  return typeSchema;
}
