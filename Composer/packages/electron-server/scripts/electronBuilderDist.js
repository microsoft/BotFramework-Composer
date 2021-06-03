// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const { resolve } = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

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
  const cmd = `"${electronBuilderBinary}" --projectDir "${electronServerDir}" --${platform} --x64 --prepackaged "${unpackedAppDir}" --config electron-builder-config.json`;
  log.info('Executing command: ', cmd);

  execSync(cmd, { stdio: 'inherit' }); // lgtm [js/shell-command-injection-from-environment]
} catch (e) {
  log.error('Error occurred while using electron-builder --dir: ', e);
  process.exit(1);
}
