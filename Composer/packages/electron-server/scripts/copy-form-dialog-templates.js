// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs-extra');
const { resolve } = require('path');
const electronBuildConfig = require('../electron-builder-config.json');

const tag = 'copy-form-dialogs-templates.js';

const source = resolve(__dirname, '../../../node_modules/@microsoft/bf-generate-library/templates');
const unpackedDir = 'app.asar.unpacked/form-dialog-templates';
console.log(`[${tag}] Copying templates from: ${source}`);

let destination;
switch (process.platform) {
  case 'darwin':
    const productName = electronBuildConfig.productName;
    destination = resolve(__dirname, `../dist/mac/${productName}.app/Contents/Resources`, unpackedDir);
    console.log(`[${tag}] Mac detected. Copying templates to: ${destination}`);
    break;

  case 'linux':
    destination = resolve(__dirname, '../dist/linux-unpacked/resources', unpackedDir);
    console.log(`[${tag}] Linux detected. Copying templates to: ${destination}`);
    break;

  case 'win32':
    destination = resolve(__dirname, '../dist/win-unpacked/resources', unpackedDir);
    console.log(`[${tag}] Windows detected. Copying templates to ${destination}`);
    break;

  default:
    console.error(`[${tag}] Detected platform is not Mac / Linux / Windows`);
    process.exit(1);
}

// copy templates from bf-generate-library/templates to asar unpacked dir under packaged electron app
fs.copy(source, destination, { filter: (src) => !src.endsWith('.md') }, (err) => {
  if (err) {
    console.error(`[${tag}] Error while copying plugins: `, err);
    return;
  }
  console.log(`[${tag}] Copied plugins successfully.`);
});
