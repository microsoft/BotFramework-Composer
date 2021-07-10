// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('path');

const rimraf = require('rimraf');

const rootDir = path.resolve(__dirname, '..');

const BOTS_DIR = process.env.COMPOSER_BOTS_FOLDER || path.resolve(rootDir, 'cypress/__test_bots__');
const APP_DATA = process.env.COMPOSER_APP_DATA || path.resolve(rootDir, 'cypress/__e2e_data.json');

const cleanAll = process.argv.indexOf('--all') !== -1;

function cleanup() {
  try {
    rimraf.sync(path.join(BOTS_DIR, cleanAll ? '**' : 'TestBot_TestSample'));
  } catch {
    // do nothing
  }

  try {
    rimraf.sync(APP_DATA);
  } catch {
    // do nothing
  }
}

cleanup();
