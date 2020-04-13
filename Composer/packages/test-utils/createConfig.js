// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const mergeConfig = require('./mergeConfig');
const baseConfig = require('./base/jest.config');
const reactConfig = require('./react/jest.config');

const TYPES = {
  base: baseConfig,
  react: reactConfig,
};

/**
 *
 * @param {string} name
 * @param {("base"|"react")} type
 * @param {JestConfig} overrides
 */
function createConfig(name, type, overrides = {}) {
  const config = TYPES[type];

  if (!config) {
    throw new Error(`Unsupported jest configuration. Choose between ${Object.keys(TYPES).join(' | ')}`);
  }

  return mergeConfig(config, {
    displayName: name,
    ...overrides,
  });
}

module.exports = createConfig;
