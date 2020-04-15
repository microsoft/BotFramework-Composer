// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const mergeConfig = require('./mergeConfig');
const nodeConfig = require('./node/jest.config');
const reactConfig = require('./react/jest.config');

const TYPES = {
  node: nodeConfig,
  react: reactConfig,
};

function createConfig(name, type, jestOverrides = {}) {
  const config = TYPES[type];

  if (!config) {
    throw new Error(`Unsupported jest configuration. Choose between ${Object.keys(TYPES).join(' | ')}`);
  }

  return mergeConfig(
    { ...config },
    {
      displayName: name,
      ...jestOverrides,
    }
  );
}

module.exports = createConfig;
