// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('azurePublishNew', 'node', {
  testMatch: ['**/?(*.)+(test).ts'],
  verbose: true,
});
