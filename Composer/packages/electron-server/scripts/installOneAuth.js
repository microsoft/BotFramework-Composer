// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const { ensureDir, remove } = require('fs-extra');
const tar = require('tar');
const glob = require('globby');

const { log } = require('./common');

/**
 * USAGE:
 * Set the following npm config environment variables to install oneauth from the ADO registry.
 * Then invoke `node scripts/installOneAuth.js`.
 *   - npm_config_username
 *   - npm_config__password (note the double _)
 *   - npm_config_registry
 */

let packageName = null;

switch (process.platform) {
  case 'darwin':
    packageName = 'oneauth-mac';
    log.info('Mac detected. Using %s package.', packageName);
    break;
  case 'win32':
    packageName = 'oneauth-win64';
    log.info('[installOneAuth.js] Windows detected. Using %s package.', packageName);
    break;
  default:
    log.error('[installOneAuth.js] Detected platform is not Mac / Windows.');
    process.exit(1);
}

if (packageName === null) {
  process.exit(1);
}

const outDir = path.resolve(__dirname, '../oneauth-temp');

// check for env variables
['username', '_password', 'registry'].forEach((configKey) => {
  if (!process.env[`npm_config_${configKey}`]) {
    log.error(`Must set npm_config_${configKey} to use.`);
    process.exit(1);
  }
});

async function downloadPackage() {
  log.info('[installOneAuth.js] Starting download.');
  await ensureDir(outDir);
  try {
    execSync(`cd ${outDir} && npm pack ${packageName}`, { encoding: 'utf-8' });
  } catch (err) {
    process.exit(1);
    return;
  }

  // find tgz
  const files = await glob('oneauth*.tgz', { cwd: outDir });

  if (files.length !== 1) {
    log.error('[installOneAuth.js] Did not find exactly 1 archive. Exiting.');
    process.exit(1);
    return;
  }

  return path.join(outDir, files[0]);
}

async function extractPackage(archivePath) {
  log.info('[installOneAuth.js] Extracting tarball.');
  await tar.extract({
    file: archivePath,
    strip: 1,
    C: outDir,
    strict: true,
  });
  log.info('[installOneAuth.js] Done extracting.');
  return archivePath;
}

async function cleanUp(archivePath) {
  log.info('[installOneAuth.js] Cleaning up archive.');
  await remove(archivePath);
}

remove(outDir)
  .then(ensureDir(outDir))
  .then(downloadPackage)
  .then(extractPackage)
  .then(cleanUp)
  .then(() => {
    log.info('[installOneAuth.js] Done installing oneauth.');
    process.exit(0);
  })
  .catch((err) => {
    log.error('[installOneAuth.js] Error downloading oneauth. ', err);
    process.exit(1);
  });
