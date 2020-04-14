// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Config } from '@jest/types';
import { TransformOptions } from '@babel/core';

declare enum ConfigType {
  node = 'node',
  react = 'react',
}

export function createConfig(
  name: string,
  type: ConfigType,
  jestOverrides?: Partial<Config.ProjectConfig>,
  babelOverrides?: TransformOptions
): Partial<Config.ProjectConfig>;

export * from '@testing-library/react';
