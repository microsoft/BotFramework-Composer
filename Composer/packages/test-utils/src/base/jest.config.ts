// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { JestOverrides } from '../types';

const base: Partial<JestOverrides> = {
  testPathIgnorePatterns: ['/node_modules/', '/mocks/', '__mocks__', '/testUtils/', 'setupTests.ts', '.*\\.d\\.ts'],

  transformIgnorePatterns: ['/node_modules/'],

  setupFilesAfterEnv: [path.resolve(__dirname, 'setup.js')],
};

export default base;
