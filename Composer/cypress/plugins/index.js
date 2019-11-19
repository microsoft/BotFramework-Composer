/* eslint-disable @typescript-eslint/no-var-requires */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');

module.exports = on => {
  on('file:preprocessor', cypressTypeScriptPreprocessor);
};
