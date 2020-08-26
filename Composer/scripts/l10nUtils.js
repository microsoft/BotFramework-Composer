// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function keep(obj, keptFields, transform = (x) => x) {
  const out = {};
  for (const key of Object.keys(obj)) {
    if (keptFields.includes(key) && typeof obj[key] === 'string') {
      out[key] = transform(obj[key]);
    }
    if (typeof obj[key] === 'object') {
      const value = keep(obj[key], keptFields, transform);
      if (Object.keys(value).length === 0) continue;
      out[key] = value;
    }
  }
  return out;
}

const ENCODE = {
  a: 'ā',
  e: 'ə',
  i: 'ï',
  o: 'ø',
  u: 'ů',
  A: 'Λ',
  E: '∃',
  I: 'Ⅱ',
  O: '⨀',
  U: '⩁',
};

function transFn(str) {
  try {
    return (
      '[ 🔴 ' +
      str
        .split('')
        .map((ch) => ENCODE[ch] || ch)
        .join('') +
      '🟢 ]'
    );
  } catch (e) {
    console.log('error encountered transforming "' + str + '"');
  }
}

module.exports = {
  transFn: transFn,
  keep: keep,
};
