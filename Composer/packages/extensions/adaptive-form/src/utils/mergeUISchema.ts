// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';

import DefaultUISchema from '../defaultUiSchema';

const mergeArrays = (objValue: any, srcValue: any) => {
  if (isArray(objValue)) {
    return srcValue;
  }
};

export function mergeUISchema(...overrides: UISchema[]): UISchema {
  return mergeWith({} as UISchema, DefaultUISchema, ...overrides, mergeArrays);
}
