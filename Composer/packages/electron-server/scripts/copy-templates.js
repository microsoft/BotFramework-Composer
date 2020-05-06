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
    destination = resolve(__dirname, `../dist/mac/${productName}.app/Contents/Resources/app.asar.unpacked/BotProject`);
    console.log('[copy-plugins.js] Mac detected. Copying plugins to: ', destination);
    break;

  case 'linux':
    destination = resolve(__dirname, '../dist/linux-unpacked/resources/app.asar.unpacked/BotProject');
    console.log('[copy-plugins.js] Linux detected. Copying plugins to: ', destination);
    break;

  case 'win32':
    destination = resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked/BotProject');
    console.log(`[copy-plugins.js] Windows detected. Copying plugins from ${source} to ${destination}`);
    break;

  default:
    console.error('[copy-plugins.js] Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

console.log(`[copy-templates.js] Copying BotProject from ${source} to ${destination}`);

// copy project templates to build directory to be packaged
fs.copy(source, destination, err => {
  if (err) {
    console.error('[copy-templates.js] Error while copying templates:');
    return;
  }
  console.log('[copy-templates.js] Copied templates successfully.');
});
