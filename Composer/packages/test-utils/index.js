// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const testingLib = require('@testing-library/react');
const hooksLib = require('@testing-library/react-hooks');

const createConfig = require('./createConfig');

module.exports = testingLib;
module.exports.hooks = hooksLib;

// Object.keys(testingLib).forEach(n => {
//   module.exports[n] = testingLib[n];
// });

module.exports.createConfig = createConfig;
