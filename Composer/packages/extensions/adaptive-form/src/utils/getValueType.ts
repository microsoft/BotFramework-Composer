// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isNumber from 'lodash/isNumber';

/**
 * Returns JSON Schema type for given value.
 */
export function getValueType(value: unknown) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (isNumber(value)) {
    return Number.isInteger(value) ? 'integer' : 'number';
  }

  return typeof value;
}
