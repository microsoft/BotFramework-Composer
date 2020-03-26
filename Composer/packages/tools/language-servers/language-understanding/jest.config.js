// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');

module.exports = {
  displayName: 'lsp-lu',
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: ['/node_modules/', '/helpers/', '/mocks/'],
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
