// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

import mergeConfig from './mergeConfig';
import nodeConfig from './node/jest.config';
import reactConfig from './react/jest.config';
import { JestOverrides } from './types';

const TYPES = {
  node: nodeConfig,
  react: reactConfig,
};

enum ConfigType {
  node = 'node',
  react = 'react',
}

export function createConfig(name: string, type: ConfigType, jestOverrides: Partial<JestOverrides> = {}) {
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
