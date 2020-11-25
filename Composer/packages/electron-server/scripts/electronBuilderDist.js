// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { resolve } = require('path');
// eslint-disable-next-line security/detect-child-process
const { exec } = require('child_process');

const { log } = require('./common');

/*
 * Calls electron-builder to take the pre-packed app contents and turn them into
 * a packaged, distributable application for the host OS
 */
try {
  const electronBuilderBinary = resolve(__dirname, '../../../node_modules/.bin/electron-builder');
  const electronServerDir = resolve(__dirname, '..');
  let platform;
  let unpackedAppDir;
  switch (process.platform) {
    case 'darwin':
      platform = 'mac';
      unpackedAppDir = 'dist/mac';
      break;

    case 'linux':
      platform = 'linux';
      unpackedAppDir = resolve(electronServerDir, 'dist/linux-unpacked');
      break;

    case 'win32':
      platform = 'win';
      unpackedAppDir = resolve(electronServerDir, 'dist/win-unpacked');
      break;

    default:
      throw new Error('Platform detected is not Mac, Linux, or Windows.');
  }

  // call electron-builder . --prepackaged --config electron-builder-config.json
  const cmd = `"${electronBuilderBinary}" "${electronServerDir}" --${platform} --x64 --prepackaged "${unpackedAppDir}" --config electron-builder-config.json`;
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
      throw new Error(`[electronBuilderDist.js] electron-builder exited with code ${code}`);
    }
  });
} catch (e) {
  log.error('Error occurred while using electron-builder --dir: ', e);
  process.exit(1);
}
