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
