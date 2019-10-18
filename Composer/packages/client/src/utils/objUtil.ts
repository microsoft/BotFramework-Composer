/**
 * obfuscate object member values to '*****'
 * @param obj
 */
export const obfuscate = (obj: Record<string, any> | string | number | boolean) => {
  const OBFUSCATED_VALUE = '*****';
  if (typeof obj !== 'object') {
    return OBFUSCATED_VALUE;
  }
  if (Array.isArray(obj)) {
    return obj.map(x => obfuscate(x));
  }

  return obj ? Object.keys(obj).reduce((prev, k) => ({ ...prev, [k]: obfuscate(obj[k]) }), {}) : OBFUSCATED_VALUE;
};
