// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('ui-plugin/select-skill-dialog', 'react', {
  testPathIgnorePatterns: ['__tests__/constants.ts', 'lib'],
});
