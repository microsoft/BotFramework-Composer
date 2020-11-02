// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');

const fs = require('fs-extra');

const electronBuildConfig = require('../electron-builder-config.json');

const { log } = require('./common');

const oneauthSource = () => {
  const oneauthPath = path.resolve(__dirname, '../oneauth-temp');
  if (['win32', 'darwin'].includes(process.platform) && fs.existsSync(oneauthPath)) {
    return { source: oneauthPath, dest: 'oneauth', force: true };
  } else {
    log.info('Skipping OneAuth. Either on an unsupported platform or it has not been installed to %s.', oneauthPath);
  }
};

const sources = [
  // extensions
  { source: path.resolve(__dirname, '../../../../extensions'), dest: 'extensions' },
  // runtimes
  { source: path.resolve(__dirname, '../../../../runtime'), dest: 'runtime' },
  // form-dialog templates
  {
    source: path.resolve(__dirname, '../../../node_modules/@microsoft/bf-generate-library/templates'),
    dest: 'form-dialog-templates',
  },
  // oneauth
  oneauthSource(),
].filter(Boolean);

let destinationDir;
switch (process.platform) {
  case 'darwin': {
    const productName = electronBuildConfig.productName;
    destinationDir = path.resolve(__dirname, `../dist/mac/${productName}.app/Contents/Resources/app.asar.unpacked`);
    log.info('Mac detected. Copying artifacts to: ', destinationDir);
    break;
  }

  case 'linux':
    destinationDir = path.resolve(__dirname, '../dist/linux-unpacked/resources/app.asar.unpacked');
    log.info('Linux detected. Copying artifacts to: ', destinationDir);
    break;

  case 'win32':
    destinationDir = path.resolve(__dirname, '../dist/win-unpacked/resources/app.asar.unpacked');
    log.info(`Windows detected. Copying artifacts to ${destinationDir}`);
    break;

  default:
    log.error('Detected platform is not Mac / Linux / Windows');
    process.exit(1);
}

const filterOutTS = (src) => {
  // true keeps the file, false omits it
  return !src.endsWith('.ts') || !src.endsWith('.ts.map');
};

async function copyArtifacts(source, dest, force = false) {
  log.info('-------- %s --------', dest);
  log.info('Copying %s from: %s', dest, source);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (force || entry.isDirectory()) {
      const extPath = path.join(source, entry.name);
      const output = path.join(destinationDir, dest, entry.name);
      log.info('Copying %s', entry.name);

      await fs.copy(extPath, output, { filter: filterOutTS });
    }
  }
}

async function copyAll() {
  for (const source of sources) {
    await copyArtifacts(source.source, source.dest, source.force);
  }
}

copyAll()
  .then(() => {
    log.info('Copied artifacts successfully.');
    process.exit(0);
  })
  .catch((err) => {
    log.error('Error while copying artifacts: ', err);
    process.exit(1);
  });
