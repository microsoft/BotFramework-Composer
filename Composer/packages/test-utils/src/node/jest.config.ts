// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import mergeConfig from '../mergeConfig';
import baseConfig from '../base/jest.config';

export default mergeConfig(baseConfig, {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js?$': path.resolve(__dirname, 'preprocess.js'),
    '^.+\\.ts?$': path.resolve(__dirname, 'preprocess.js'),
  },
});
