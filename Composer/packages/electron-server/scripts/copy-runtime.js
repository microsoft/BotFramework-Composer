// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');
const electronBuildConfig = require('../electron-builder-config.json');

const source = resolve(__dirname, '../../../../runtime');

let destination;
switch (process.platform) {
  case 'darwin':
    const productName = electronBuildConfig.productName;
    destination = resolve(__dirname, `../dist/mac/${productName}.app/Contents/Resources/app.asar.unpacked/runtime`);
    console.log(`[copy-runtime.js] Mac detected. Copying runtime from ${source} to ${destination}`);
    break;

  case 'linux':
    destination = resolve(__dirname, '../dist/linux-unpacked/resources/app.asar.unpacked/runtime');
    console.log(`[copy-runtime.js] Linux detected. Copying runtime from ${source} to ${destination}`);
    break;

  case 'win32':
    destination = resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked/runtime');
    console.log(`[copy-runtime.js] Windows detected. Copying runtime from ${source} to ${destination}`);
    break;

  default:
    console.error('[copy-runtime.js] Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

// copy bot runtime to build directory to be packaged
fs.copy(source, destination, (err) => {
  if (err) {
    console.error('[copy-runtime.js] Error while copying runtime:');
    process.exit(1);
    return;
  }
  console.log('[copy-runtime.js] Copied runtime successfully.');
});
