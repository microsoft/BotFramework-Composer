// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const path = require('path');
const electronBuildConfig = require('../electron-builder-config.json');

const source = path.resolve(__dirname, '../../../../extensions');
console.log('[copy-extensions.js] Copying extensions from: ', source);

let destination;
switch (process.platform) {
  case 'darwin':
    const productName = electronBuildConfig.productName;
    destination = path.resolve(
      __dirname,
      `../dist/mac/${productName}.app/Contents/Resources/app.asar.unpacked/extensions`
    );
    console.log('[copy-extensions.js] Mac detected. Copying extensions to: ', destination);
    break;

  case 'linux':
    destination = path.resolve(__dirname, '../dist/linux-unpacked/resources/app.asar.unpacked/extensions');
    console.log('[copy-extensions.js] Linux detected. Copying extensions to: ', destination);
    break;

  case 'win32':
    destination = path.resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked/extensions');
    console.log(`[copy-extensions.js] Windows detected. Copying extensions from ${source} to ${destination}`);
    break;

  default:
    console.error('[copy-extensions.js] Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

const filterOutTS = (src) => {
  // true keeps the file, false omits it
  return !src.endsWith('.ts');
};

// copy extensions from /extensions/ to pre-packaged electron app
async function copyExtensions() {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      console.log('[copy-extensions.js] Copying %s.', entry.name);
      const extPath = path.join(source, entry.name);
      const output = path.join(destination, entry.name);

      await fs.copy(extPath, output, { filter: filterOutTS });
    }
  }
}

copyExtensions()
  .then(() => {
    console.log('[copy-extensions.js] Copied extensions successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[copy-extensions.js] Error while copying extensions: ', err);
    process.exit(1);
  });
