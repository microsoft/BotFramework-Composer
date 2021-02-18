// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';

function mergeConfig<T extends object>(base: T, overrides?: T) {
  if (!overrides) {
    return base;
  }

  return mergeWith(cloneDeep(base), overrides, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return srcValue.concat(objValue);
    }
  });
}

export default mergeConfig;
