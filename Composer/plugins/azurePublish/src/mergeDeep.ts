// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import mergeWith from 'lodash/mergeWith';

/**
 * Originally found on Stack Overflow:
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge *
 */

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeObject(targetValue, srcValue) {
  if (Array.isArray(targetValue)) {
    return targetValue.concat(srcValue);
  } else if (!isObject(targetValue)) {
    return targetValue ? targetValue : srcValue;
  } else {
    // merge two objects
    Object.keys(srcValue).forEach((key) => {
      mergeObject(targetValue[key], srcValue[key]);
    });
    return targetValue;
  }
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, source) {
  return mergeWith(target, source, mergeObject);
}
