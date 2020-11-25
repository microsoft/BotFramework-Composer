// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('adaptive-form', 'react', {
  coveragePathIgnorePatterns: ['defaultRoleSchema.ts', 'defaultUiSchema.ts'],
});
