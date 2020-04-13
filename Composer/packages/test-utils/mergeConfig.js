// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const mergeWith = require('lodash/mergeWith');
const isArray = require('lodash/isArray');

/**
 *
 * @param {object} base
 * @param {object} jestOverrides
 */
function mergeConfig(base, jestOverrides = {}) {
  return mergeWith({}, base, jestOverrides, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}

module.exports = mergeConfig;
