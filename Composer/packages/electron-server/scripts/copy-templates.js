// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');

const source = resolve(__dirname, '../../../../BotProject/Templates');
const destination = resolve(__dirname, '../build/templates');

// copy project templates to build directory to be packaged
// Async with callbacks:
fs.copy(source, destination, err => {
  if (err) return console.error('[copy-templates.js] Error while copying templates:');
  console.log('[copy-templates.js] Copied templates successfully.');
});
