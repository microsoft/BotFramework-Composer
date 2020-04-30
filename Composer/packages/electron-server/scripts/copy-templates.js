// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');

const source = resolve(__dirname, '../../../../runtime');
const destination = resolve(__dirname, '../build/templates');
console.log(`[copy-templates.js] Copying templates from ${source} to ${destination}`);

// copy project templates to build directory to be packaged
fs.copy(source, destination, err => {
  if (err) {
    console.error('[copy-templates.js] Error while copying templates:');
    return;
  }
  console.log('[copy-templates.js] Copied templates successfully.');
});
