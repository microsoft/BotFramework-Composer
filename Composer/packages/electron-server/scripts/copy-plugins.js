// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');
const electronBuildConfig = require('../electron-builder-config.json');

const source = resolve(__dirname, '../../../plugins');
console.log('[copy-plugins.js] Copying plugins from: ', source);

let destination;
switch (process.platform) {
  case 'darwin':
    const productName = electronBuildConfig.productName;
    destination = resolve(
      __dirname,
      `../dist/mac/${productName}.app/Contents/Resources/app.asar.unpacked/build/plugins`
    );
    console.log('[copy-plugins.js] Mac detected. Copying plugins to: ', destination);
    break;

  case 'linux':
    destination = resolve(__dirname, '../dist/linux-unpacked/resources/app.asar.unpacked/build/plugins');
    console.log('[copy-plugins.js] Linux detected. Copying plugins to: ', destination);
    break;

  case 'win32':
    destination = resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked/build/plugins');
    console.log(`[copy-plugins.js] Windows detected. Copying plugins from ${source} to ${destination}`);
    break;

  default:
    console.error('[copy-plugins.js] Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

const filterOutTS = (src) => {
  // true keeps the file, false omits it
  return !src.endsWith('.ts');
};

// copy plugins from /Composer/plugins/ to pre-packaged electron app
fs.copy(source, destination, { filter: filterOutTS }, (err) => {
  if (err) {
    console.err('[copy-plugins.js] Error while copying plugins: ', err);
    return;
  }
  console.log('[copy-plugins.js] Copied plugins successfully.');
});
