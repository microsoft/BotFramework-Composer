// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('intellisense', 'react', {
  coveragePathIgnorePatterns: [],
});
