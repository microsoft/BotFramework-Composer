// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import os from 'os';
import childProcess from 'child_process';

import { Path } from '../utility/path';

export const absHosted = process.env.COMPOSER_AUTH_PROVIDER === 'abs-h';
export const absHostRoot = process.env.WEBSITE_HOSTNAME
  ? `https://${process.env.WEBSITE_HOSTNAME}`
  : 'http://localhost:3978';

let folder = process.env.COMPOSER_BOTS_FOLDER;
if (folder?.endsWith(':')) {
  folder = folder + '/';
}

let names: string[] = [];
const getDiskNames = (text: string) => {
  names = text
    .split('\r\r\n')
    .filter((token) => token.indexOf(':') > -1)
    .map((token) => token.trim().replace(/\\/g, '/'));
  return names;
};
if (os.platform() === 'win32') {
  try {
    const stdout = childProcess.execSync(`wmic volume get name`).toString();
    names = getDiskNames(stdout);
  } catch (err) {
    console.log(err);
  }
}

// resolves a path from Composer root directory
const resolveFromRoot = (path: string) => {
  const composerRoot = Path.resolve(__dirname, '../../../..');
  return Path.resolve(composerRoot, path);
};

export const diskNames = names;
export const platform = os.platform();
export const environment = process.env.NODE_ENV || 'development';
export const botsFolder = folder;
export const botEndpoint = process.env.BOT_ENDPOINT || 'http://localhost:3979';
export const appDataPath = process.env.COMPOSER_APP_DATA || Path.resolve(__dirname, '../../data.json');
export const templateGeneratorPath = process.env.TEMPLATE_GENERATOR_PATH || resolveFromRoot('.yo-repository');
export const runtimeFolder = process.env.COMPOSER_RUNTIME_FOLDER || resolveFromRoot('../runtime');
export const runtimeFrameworkVersion = process.env.COMPOSER_RUNTIME_VERSION || 'netcoreapp3.1';
export const extensionManifestPath =
  process.env.COMPOSER_EXTENSION_MANIFEST || resolveFromRoot('.composer/extensions.json');
export const extensionDataDir = process.env.COMPOSER_EXTENSION_DATA_DIR || resolveFromRoot('.composer/extension-data');
export const extensionsbuiltinDir = process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR || resolveFromRoot('../extensions');
export const extensionsRemoteDir =
  process.env.COMPOSER_REMOTE_EXTENSIONS_DIR || resolveFromRoot('.composer/extensions');
