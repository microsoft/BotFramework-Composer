// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

/**
 * Returns true if dir is a descendant of parent, false otherwise.
 * @param parent parent directory
 * @param dir directory to test
 */
export function isSubdirectory(parent, dir) {
  const relative = path.relative(parent, dir);
  return Boolean(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}
