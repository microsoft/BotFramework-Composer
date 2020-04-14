// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const testingLib = require('@testing-library/react');

const createConfig = require('./createConfig');

Object.keys(testingLib).forEach(n => {
  module.exports[n] = testingLib[n];
});

module.exports.createConfig = createConfig;
module.exports = createConfig;
