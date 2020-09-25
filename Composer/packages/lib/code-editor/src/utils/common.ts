// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

export function isElectron(): boolean {
  return !(window as any).__IS_ELECTRON__;
}
