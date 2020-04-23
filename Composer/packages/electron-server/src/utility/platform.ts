// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function isMac() {
  return process.platform === 'darwin';
}

export function isLinux() {
  return process.platform === 'linux';
}

export function isWindows() {
  return process.platform === 'win32';
}
