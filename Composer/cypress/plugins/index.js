// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */

const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');

module.exports = on => {
  on('file:preprocessor', cypressTypeScriptPreprocessor);
};
