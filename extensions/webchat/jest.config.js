// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('webchat-directline', 'node', {
  testMatch: ['**/?(*.)+(spec).ts', '**/?(*.)+(test).ts'],
  verbose: true,
});
