// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs');
const path = require('path');

const localePath = 'packages/server/src/locales';

let errorCount = 0;

const dir = fs.opendirSync(localePath);
for (;;) {
  const dirent = dir.readSync();
  if (dirent == null) break;
  const data = fs.readFileSync(path.join(localePath, dirent.name));
  const json = JSON.parse(data);
  for (const [key, val] of Object.entries(json)) {
    const msg = val.message;

    const src = `${dirent.name} at ${key}:`;
    if (/\{.*plural.*}/.exec(msg)) {
      // if we're in a "plural" rules section...
      if (/=\s+\d+/.exec(msg)) {
        console.log(src, `whitespace between number and =`);
        errorCount += 1;
      }
      if (/=\d+/.exec(msg) && !/other/.exec(msg)) {
        console.log(src, `missing 'other' clause`);
        errorCount += 1;
      }
    }
    if (/(\p{L}|\s|\w)'(\p{L}|\w)/.exec(msg)) {
      console.log(src, `single quote between letters`);
      errorCount += 1;
    }
    if (/([^']\{')|('\}[^'])/.exec(msg)) {
      console.log(src, `incorrect brace quoting`);
      errorCount += 1;
    }
  }
}

process.exit(errorCount);
