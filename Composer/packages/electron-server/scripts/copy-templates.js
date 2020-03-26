// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');

const source = resolve(__dirname, '../../../../BotProject/Templates');
const destination = resolve(__dirname, '../build/templates');
console.log(`[copy-templates.js] Copying templates from ${source} to ${destination}`);

// copy project templates to build directory to be packaged
fs.copy(source, destination)
  .then(console.log('[copy-templates.js] Copied templates successfully.'))
  .catch(err => console.err('[copy-templates.js] Error while copying templates: ', err));
