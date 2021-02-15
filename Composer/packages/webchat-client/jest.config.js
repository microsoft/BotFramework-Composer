// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('webchat-client', 'react', {
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setupTests.js', '/lib/'],
});
