// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

module.exports = {
  transform: {
    '^.+\\.js$': path.resolve(__dirname, 'preprocess.js'),
    '^.+\\.ts$': path.resolve(__dirname, 'preprocess.js'),
  },

  testPathIgnorePatterns: ['/node_modules/', '/mocks/', '__mocks__', '/testUtils/', 'setupTests.ts', '.*\\.d\\.ts'],

  transformIgnorePatterns: ['/node_modules/'],

  setupFilesAfterEnv: [path.resolve(__dirname, 'setup.js')],
};
