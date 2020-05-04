// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, dirname } from 'path';

import { app } from 'electron';

/* Returns the path to the application's unpacked asar contents */
export function getUnpackedAsarPath(): string {
  if (app.isPackaged) {
    return join(dirname(app.getAppPath()), 'app.asar.unpacked');
  }
  return '';
}
