// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import fs from 'fs-extra';

const isProduction = process.env.NODE_ENV === 'production';

export function getVersion(): string {
  try {
    const version = fs.readJSONSync(path.join(__dirname, '../../../electron-server/package.json')).version;
    return isProduction ? version : `${version}-DEV`;
  } catch {
    return 'unknown';
  }
}
