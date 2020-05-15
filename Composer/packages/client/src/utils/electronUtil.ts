// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Returns true if the client is embedded in the Composer Electron environment.
 */
export function isElectron(): boolean {
  return !!window.__IS_ELECTRON__;
}
