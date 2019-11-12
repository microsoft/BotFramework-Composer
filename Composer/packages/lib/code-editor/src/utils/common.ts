// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function assignDefined(target, ...sources) {
  const copyTarget = { ...target };
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined) {
        copyTarget[key] = val;
      }
    }
  }
  return copyTarget;
}
