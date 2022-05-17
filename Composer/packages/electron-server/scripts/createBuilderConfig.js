// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { join, resolve } = require('path');
const { writeFileSync } = require('fs');

const packageJson = require('../package.json');

const electronVersion = packageJson.devDependencies.electron;

const electronServerDir = resolve(__dirname, '..');

const createBuilderConfig = (platform) => {
  const builderConfig = require('../electron-builder-config.json');
  const configName = `electron-builder-config-${platform}.json`;
  switch (platform) {
    case 'mac':
    case 'linux':
      builderConfig.electronDownload = {
        version: electronVersion,
      };
      break;
    case 'win':
      builderConfig.electronDist = 'customElectron';
      break;
    default:
      throw new Error(
        `Invalid platform specified for builder config generation (${platform}). Supported platforms are: mac, linux and windows`
      );
  }
  writeFileSync(join(electronServerDir, configName), JSON.stringify(builderConfig, null, 2));
  return configName;
};

exports.createBuilderConfig = createBuilderConfig;
