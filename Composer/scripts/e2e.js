// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-child-process */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { spawn, execSync } = require('child_process');

const mkdir = promisify(fs.mkdir);

const rootDir = path.resolve(__dirname, '..');

process.env.COMPOSER_BOTS_FOLDER = path.resolve(rootDir, 'cypress/__test_bots__');
process.env.COMPOSER_APP_DATA = path.resolve(rootDir, 'cypress/__e2e_data.json');

async function processArgs() {
  const args = process.argv.slice(2);
  const folder = args.indexOf('--bots');
  const data = args.indexOf('--data');

  if (folder > -1 && args[folder + 1]) {
    process.env.COMPOSER_BOTS_FOLDER = args[folder + 1];
  }

  if (data > -1 && args[data + 1]) {
    process.env.COMPOSER_APP_DATA = args[data + 1];
  }
}

async function setup() {
  try {
    await mkdir(process.env.COMPOSER_BOTS_FOLDER);
    console.log('using url', process.env.PORT);
  } catch (err) {
    process.stderr.write('There was a problem setting up.\n');
    process.stderr.write(`Error:\n${err.message}\n`);
  }
}

async function run() {
  return new Promise(resolve => {
    const server = spawn('yarn', ['start:dev'], { cwd: path.resolve(rootDir), stdio: 'inherit' });

    server.on('close', () => {
      console.log('server close');
      resolve();
    });

    const cleanupServer = code => server.kill(code);

    ['beforeExit', 'SIGINT'].forEach(evt => {
      process.on(evt, cleanupServer);
    });
  });
}

function cleanup() {
  execSync(`node ${path.resolve(__dirname, 'clean-e2e.js')}`);
}

processArgs()
  .then(setup)
  .then(run)
  .then(cleanup);

process.on('SIGINT', cleanup);
