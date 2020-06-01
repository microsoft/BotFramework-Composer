// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Config } from '@jest/types';
import * as hooksLib from '@testing-library/react-hooks';

declare enum ConfigType {
  node = 'node',
  react = 'react',
}

export function createConfig(
  name: string,
  type: ConfigType,
  jestOverrides?: Partial<Config.ProjectConfig>
): Partial<Config.ProjectConfig>;

export * from '@testing-library/react';

export const hooks = hooksLib;
