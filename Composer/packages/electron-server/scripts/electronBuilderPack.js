// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { resolve } = require('path');
// eslint-disable-next-line security/detect-child-process
const { exec } = require('child_process');

const { log } = require('./common');

/*
 * Calls electron-builder to pre-pack the app contents into what
 * will be packaged inside of the OS-specific distributable application
 */
try {
  const electronBuilderBinary = resolve(__dirname, '../node_modules/.bin/electron-builder');
  const electronServerDir = resolve(__dirname, '..');
  let platform;
  switch (process.platform) {
    case 'darwin':
      platform = 'mac';
      break;

    case 'linux':
      platform = 'linux';
      break;

    case 'win32':
      platform = 'win';
      break;

    default:
      throw new Error('Platform detected is not Mac, Linux, or Windows.');
  }

  // call electron-builder . --dir --config electron-builder-config.json
  const cmd = `"${electronBuilderBinary}" "${electronServerDir}" --dir --${platform} --x64 --config electron-builder-config.json`;
  log.info('Executing command: ', cmd);

  const proc = exec(cmd);
  proc.stdout.on('data', (data) => {
    console.log(data);
  });
  proc.stderr.on('data', (data) => {
    console.error(data);
  });
  proc.on('close', (code) => {
    if (code !== 0) {
      throw new Error(`[electronBuilderPack.js] electron-builder exited with code ${code}`);
    }
  });
} catch (e) {
  log.error('[electronBuilderPack.js] Error occurred while using electron-builder --dir: ', e);
  process.exit(1);
}
