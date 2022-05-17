// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

const { join } = require('path');

const { download } = require('@electron/get');
const extract = require('extract-zip');

const packageJson = require('../package.json');

const { log } = require('./common');

const electronVersion = packageJson.devDependencies.electron;

async function downloadAndExtract() {
  // download the custom build of Electron
  const zipPath = await download(electronVersion, {
    mirrorOptions: {
      mirror: process.env.MSFT_ELECTRON_MIRROR,
      customDir: process.env.MSFT_ELECTRON_DIR,
    },
  });
  log.info(`Electron successfully downloaded to ${zipPath}`);

  // extract the custom build into a local directory
  const extractPath = join(__dirname, '..', 'customElectron');
  await extract(zipPath, { dir: extractPath });
  log.info(`Electron successfully unzipped in ${extractPath}`);

  return extractPath;
}

downloadAndExtract()
  .then((extractPath) => log.info(`Downloaded and extracted the internal Electron build to ${extractPath}`))
  .catch((err) => {
    log.error(`Error downloading and extracting the internal Electron build: ${err}`);
    throw err;
  });
