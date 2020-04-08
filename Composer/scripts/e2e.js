// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-child-process */

// set COMPOSER_BOTS_DIRECTORY
// set COMPOSER_APP_DATA
// run tests
// clean up

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { execSync, spawn } = require('child_process');

const getPort = require('get-port');

const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);

const rootDir = path.resolve(__dirname, '..');

process.env.COMPOSER_BOTS_DIRECTORY = path.resolve(rootDir, 'cypress/__test_bots__');
process.env.COMPOSER_APP_DATA = path.resolve(rootDir, 'cypress/__e2e_data.json');
process.env.PORT = 5000;
process.env.NODE_ENV = 'production';

async function processArgs() {
  const args = process.argv.slice(2);
  const folder = args.indexOf('--bots');
  const data = args.indexOf('--data');

  if (folder > -1 && args[folder + 1]) {
    process.env.COMPOSER_BOTS_DIRECTORY = args[folder + 1];
  }

  if (data > -1 && args[data + 1]) {
    process.env.COMPOSER_APP_DATA = args[data + 1];
  }

  const port = await getPort({ port: getPort.makeRange(5000, 6000) });
  // eslint-disable-next-line require-atomic-updates
  process.env.PORT = port;
}

async function setup() {
  try {
    await mkdir(process.env.COMPOSER_BOTS_DIRECTORY);
    console.log('using url', process.env.PORT);
  } catch (err) {
    process.stderr.write('There was a problem setting up.\n');
    process.stderr.write(`Error:\n${err.message}\n`);
  }
}

async function run() {
  return new Promise((resolve, reject) => {
    const server = spawn('yarn', ['start'], { cwd: path.resolve(rootDir, 'packages/server') });

    server.stdout.on('data', msg => {
      process.stdout.write(msg);
    });

    server.on('close', () => {
      resolve();
      console.log('server closed');
    });
  });
}

async function cleanup() {
  process.stdout.write('Cleaning up... ');

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await rmdir(process.env.COMPOSER_BOTS_DIRECTORY);
    await unlink(process.env.COMPOSER_APP_DATA);
    process.stdout.write('Done!');
  } catch (err) {
    process.stderr.write('There was a problem cleaning up.\n');
    process.stderr.write(`Error:\n${err.message}\n`);
  }
}

processArgs()
  .then(setup)
  .then(run)
  .then(cleanup)
  .then(() => console.log('all done'));
