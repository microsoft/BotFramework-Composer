// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const csv = require('@fast-csv/format');

const inPath = process.argv[2];

// eslint-disable-next-line security/detect-non-literal-fs-filename
const inJson = JSON.parse(fs.readFileSync(inPath));
const outPath = path.join(path.dirname(inPath), 'en-US.tsv');

// eslint-disable-next-line security/detect-non-literal-fs-filename
const outTSV = fs.createWriteStream(outPath);

const array = [{ Key: 'Key', Message: 'Message' }];

for (const key in inJson) {
  array.push({ Key: key, Message: inJson[key].message.replace(/(\r\n|\r|\n)/g, '\\n') });
}

csv.writeToStream(outTSV, array, {
  delimiter: '\t',
});
