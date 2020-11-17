// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const removeLineBreaks = (value: string) => {
  return value.replace(/(\r\n|\n|\r)/gm, '');
};

// TAKEN FROM - https://github.com/janl/mustache.js/blob/master/mustache.js#L55
const htmlEntityMap: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": "'",
  '/': '/',
  '`': '`',
  '=': '=',
};
const escapeHtml = (value: string) => {
  // eslint-disable-next-line no-useless-escape
  return String(value).replace(/[&<>"'`=\/]/g, (s) => htmlEntityMap[s]);
};

export const safeHtmlString = (value: string) => {
  return escapeHtml(removeLineBreaks(value));
};

/**
 * Parse csv string to get values, it accounts for escaped commas in the values
 * @param str Comma separated value string.
 */
export const csvToArray = (str: string) => {
  // eslint-disable-next-line security/detect-unsafe-regex
  const reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
  // eslint-disable-next-line security/detect-unsafe-regex
  const reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

  // If it's invalid csv return empty.
  if (!reValid.test(str)) {
    return [];
  }

  const result = [];
  str.replace(reValue, (_, m1, m2, m3) => {
    if (m1 !== undefined) result.push(m1.replace(/\\'/g, "'"));
    else if (m2 !== undefined) result.push(m2.replace(/\\"/g, '"'));
    else if (m3 !== undefined) result.push(m3);
    return '';
  });

  if (/,\s*$/.test(str)) result.push('');
  return result;
};
