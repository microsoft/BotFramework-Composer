// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { JestOverrides } from '../types';

const base: Partial<JestOverrides> = {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/mocks/',
    '__mocks__',
    '/testUtils/',
    'setupTests.ts',
    '.*\\.d\\.ts',
    'testUtils.ts',
  ],

  transformIgnorePatterns: ['/node_modules/'],

  setupFilesAfterEnv: [path.resolve(__dirname, 'setup.js')],
};

export default base;
