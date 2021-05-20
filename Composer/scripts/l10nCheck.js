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

      if (/\{[\s\S]*plural[\s\S]*}/.exec(fixedMessage)) {
        // if we're in a "plural" rules section...

        if (/=\s+\d+/.exec(fixedMessage)) {
          console.log(src, `removing whitespace between number and =`);
          fixedMessage = fixedMessage.replace(/=\s+(\d+)/gu, '=$1');
        }
        if (/=\d+/.exec(msg) && !/other/.exec(msg)) {
          console.log(src, `repairing missing 'other' clause`);
          fixedMessage = fixedMessage.replace(/\n(\s+)[^=0-9]+\s*(\{.*\})/gu, (m, p1, p2) => {
            return `\n${p1}other ${p2}`;
          });
        }
      }
      if (/\p{L}'\p{L}/u.exec(fixedMessage)) {
        console.log(src, `fixing single quote between letters`);
        fixedMessage = fixedMessage.replace(/(\p{L})'(\p{L})/gu, '$1’$2');
      }

      if (/\p{L}"\p{L}/u.exec(fixedMessage) && !dirent.name.includes('ko')) {
        console.log(src, `replacing double quote between letters with single`);
        fixedMessage = fixedMessage.replace(/(\p{L})"(\p{L})/gu, '$1’$2');
      }
      if (/([^']\{')|('\}[^'])/.exec(fixedMessage)) {
        console.log(src, `fixing incorrect brace quoting`);
        fixedMessage = fixedMessage.replace(/([^']\{')/g, "'{'").replace(/('\}[^'])/g, "'}'");
      }

      objectOut[key] = { message: fixedMessage };
    }

    fs.writeFileSync(fileName, JSON.stringify(objectOut, null, 2));
  }

  if (errorCount > 0) console.log(`${errorCount} error(s) found that can't be autofixed`);

  totalCount += errorCount;
}

process.exit(totalCount);
