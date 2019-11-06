// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}
