// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

/**
 * assign to target[key] if sources[key] != undefined
 * @param target   {a:1}
 * @param sources  {a:undefined,c:3})
 *
 * Object.assign ---> {a:undefined,c:3})
 * assignDefined ---> {a: 1, c:3}
 */
export function assignDefined(target, ...sources) {
  const copyTarget = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const val = source[key];
      if (typeof val !== 'undefined') {
        copyTarget[key] = val;
      }
    }
  }
  return copyTarget;
}
