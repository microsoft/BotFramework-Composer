// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

const mergeConfig = require('../mergeConfig');
const baseConfig = require('../base/jest.config');

module.exports = mergeConfig(baseConfig, {
  transform: {
    '^.+\\.js?$': path.resolve(__dirname, 'preprocess.js'),
    '^.+\\.ts?$': path.resolve(__dirname, 'preprocess.js'),
  },
});
