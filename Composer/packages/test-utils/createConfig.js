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

function createConfig(name, type, jestOverrides = {}, babelOverrides = {}) {
  const config = TYPES[type];

  if (!config) {
    throw new Error(`Unsupported jest configuration. Choose between ${Object.keys(TYPES).join(' | ')}`);
  }

  const jestConfig = mergeConfig(
    { ...config },
    {
      displayName: name,
      ...jestOverrides,
    }
  );

  if (Object.keys(babelOverrides).length > 0 && Object.keys(jestConfig.transform).length > 0) {
    Object.keys(jestConfig.transform).forEach(t => {
      mergeConfig(jestConfig.transform[t][1], babelOverrides);
    });
  }

  return jestConfig;
}

module.exports = createConfig;
