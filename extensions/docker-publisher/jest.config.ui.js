// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('dockerPublishDialog', 'react', {
  testMatch: ['**/?(*.)+(spec).tsx'],
  verbose: true,
});
