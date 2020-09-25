// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

export function isElectron(): boolean {
  // eslint-disable-next-line no-prototype-builtins
  return window.hasOwnProperty('__IS_ELECTRON__');
}
