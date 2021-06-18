// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-child-process */

const path = require('path');
const { promisify } = require('util');
const { spawn, execSync } = require('child_process');

const fs = require('fs-extra');
const chalk = require('chalk');

const rootDir = path.resolve(__dirname, '..');
const composerRootDir = path.resolve(rootDir, '..', '..');

process.env.COMPOSER_BOTS_FOLDER = path.resolve(rootDir, 'cypress/__test_bots__');
process.env.COMPOSER_APP_DATA = path.resolve(rootDir, 'cypress/__e2e_data.json');
let isDev = false;

async function processArgs() {
  const args = process.argv.slice(2);
  const folder = args.indexOf('--bots');
  const data = args.indexOf('--data');
  const dev = args.indexOf('--dev');

  if (folder > -1 && args[folder + 1]) {
    process.env.COMPOSER_BOTS_FOLDER = args[folder + 1];
  }

  if (data > -1 && args[data + 1]) {
    process.env.COMPOSER_APP_DATA = args[data + 1];
  }

  if (dev > -1) {
    isDev = true;
  }

  const msg = `
${chalk.green('Starting Composer:')}
  ${chalk.blue('COMPOSER_BOTS_FOLDER:')}\t${chalk.gray(process.env.COMPOSER_BOTS_FOLDER)}
  ${chalk.blue('COMPOSER_APP_DATA:')}\t${chalk.gray(process.env.COMPOSER_APP_DATA)}


Wait for the server to come up and then start cypress.
  ${chalk.blue('yarn test:integration:open')} ${chalk.gray(
    '- if you want to run a single test or run tests in watch mode'
  )}
  ${chalk.blue('yarn test:integration')} ${chalk.gray('- if you want to run the entire test suite')}
  `;
  console.log(msg);

  // wait for a second so that users can see value of ENV variables.
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

async function setup() {
  try {
    await fs.ensureDir(process.env.COMPOSER_BOTS_FOLDER);
  } catch (err) {
    process.stderr.write('There was a problem setting up.\n');
    process.stderr.write(`Error:\n${err.message}\n`);
  }
}

async function run() {
  console.log('COMPOSER ROOT', composerRootDir);
  return new Promise((resolve) => {
    const startCommand = isDev ? 'start:dev' : 'start';

    const spawnOptions = { cwd: composerRootDir, stdio: 'inherit' };
    if (process.platform === 'win32') {
      spawnOptions.shell = true;
    }
    const server = spawn('yarn', [startCommand], spawnOptions);

    server.on('close', () => {
      resolve();
    });

    const cleanupServer = (code) => server.kill(code);

    ['beforeExit', 'SIGINT'].forEach((evt) => {
      process.on(evt, cleanupServer);
    });
  });
}

function cleanup() {
  execSync(`node ${path.resolve(__dirname, 'clean-e2e.js')}`); // lgtm [js/shell-command-injection-from-environment]
}

console.clear();

processArgs().then(setup).then(run).then(cleanup);

process.on('SIGINT', cleanup);
