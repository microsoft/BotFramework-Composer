// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');

const source = resolve(__dirname, '../../../plugins');
console.log('[copy-plugins.js] Copying plugins from: ', source);

let destination;
switch (process.platform) {
  case 'darwin':
    // TODO: add mac path
    break;

  case 'linux':
    // TODO: add linux path
    break;

  case 'win32':
    destination = resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked/build/plugins');
    console.log(`[copy-plugins.js] Windows detected. Copying plugins from ${source} to ${destination}`);
    break;

  default:
    console.error('[copy-plugins.js] Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

// copy plugins from /Composer/plugins/ to pre-packaged electron app
fs.copy(source, destination)
  .then(console.log('[copy-plugins.js] Copied plugins successfully.'))
  .catch(err => console.err('[copy-plugins.js] Error while copying plugins: ', err));
