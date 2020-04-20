// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const testingLib = require('@testing-library/react');

const createConfig = require('./createConfig');

module.exports = testingLib;

// Object.keys(testingLib).forEach(n => {
//   module.exports[n] = testingLib[n];
// });

module.exports.createConfig = createConfig;
