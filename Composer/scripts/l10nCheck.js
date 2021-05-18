// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs');
const path = require('path');

const formatMessage = require('format-message');

const localePaths = ['packages/server/src/locales', 'packages/electron-server/locales'];

let totalCount = 0;

formatMessage.setup({ missingTranslation: 'ignore' });

for (const localePath of localePaths) {
  let errorCount = 0;
  console.log(`Checking within ${localePath}:`);
  const dir = fs.opendirSync(localePath);
  for (;;) {
    const dirent = dir.readSync();
    if (dirent == null) break;

    const fileName = path.join(localePath, dirent.name);

    const data = fs.readFileSync(fileName);
    const json = JSON.parse(data);
    const objectOut = {};

    for (const [key, val] of Object.entries(json)) {
      const msg = val.message;
      let fixedMessage = msg;

      const src = `${dirent.name} at ${key}:`;

      try {
        formatMessage(msg);
      } catch (e) {
        console.log(src, e);
        errorCount += 1;
      }

      if (/\{.*plural.*}/.exec(msg)) {
        // if we're in a "plural" rules section...
        if (/=\s+\d+/.exec(fixedMessage)) {
          console.log(src, `removing whitespace between number and =`);
          fixedMessage = fixedMessage.replace(/=\s+(\d+)/g, '=$1');
        }
        if (/=\d+/.exec(msg) && !/other/.exec(msg)) {
          console.log(src, `missing 'other' clause`);
          errorCount += 1;
        }
      }
      if (/(\p{L})'(\p{L})/.exec(msg)) {
        console.log(src, `fixing single quote between letters`);
        fixedMessage = fixedMessage.replace(/(\p{L})'(\p{L})/g, '$1\u2019$2'); // U+2019 is ’
      }
      if (/(\p{L})"(\p{L})/.exec(msg)) {
        console.log(src, `replacing double quote between letters with single`);
        fixedMessage = fixedMessage.replace(/(\p{L})"(\p{L})/g, '$1\u2019$2'); // U+2019 is ’
      }
      if (/([^']\{')|('\}[^'])/.exec(msg)) {
        console.log(src, `fixing incorrect brace quoting`);
        fixedMessage = fixedMessage.replace(/([^']\{')/g, "'{'").replace(/('\}[^'])/g, "'}'");
      }

      objectOut[key] = { message: fixedMessage };
    }

    fs.writeFileSync(fileName, JSON.stringify(objectOut, null, 2));
  }
  console.log(`${errorCount} error${errorCount === 1 ? '' : 's'} found that can't be autofixed`);
  totalCount += errorCount;
}

process.exit(totalCount);
