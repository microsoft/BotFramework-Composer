// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const mergeWith = require('lodash/mergeWith');
const isArray = require('lodash/isArray');

/**
 *
 * @param {JestConfiguration} base
 * @param  {...JestConfiguration} overrides
 * @param {object} options
 * @param {boolean} options.override
 */
function mergeConfig(base, ...overrides) {
  return mergeWith({}, base, ...overrides, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}

module.exports = mergeConfig;
