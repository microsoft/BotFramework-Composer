// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * obfuscate object member values to '*****'
 * @param obj
 */
export const obfuscate = (obj?: Record<string, any> | string | number | boolean) => {
  const OBFUSCATED_VALUE = '*****';
  if (!obj || typeof obj !== 'object') {
    return OBFUSCATED_VALUE;
  }
  if (Array.isArray(obj)) {
    return obj.map(obfuscate);
  }

  return Object.keys(obj).reduce((prev, k) => ({ ...prev, [k]: obfuscate(obj[k]) }), {});
};
