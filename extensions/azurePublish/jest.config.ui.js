// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('azureProvisionDialog', 'react', {
    testMatch: ['**/?(*.)+(spec).tsx'],
    verbose: true,
});