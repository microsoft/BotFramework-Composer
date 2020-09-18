// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const inPath = process.argv[2];

// eslint-disable-next-line security/detect-non-literal-fs-filename
const inJson = JSON.parse(fs.readFileSync(inPath));
const outPath = path.join(path.dirname(inPath), 'en-US.tsv');

// eslint-disable-next-line security/detect-non-literal-fs-filename
const outTSV = fs.openSync(outPath, 'w');
fs.writeSync(outTSV, 'Key\tMessage\n');

for (const key in inJson) {
  fs.writeSync(outTSV, key + '\t' + inJson[key].message.replace(/(\r\n|\r|\n)/g, '\\n') + '\n');
}

fs.closeSync(outTSV);
