// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const { transFn } = require('./l10nUtils');

const file = process.argv[2];

const inFile = JSON.parse(fs.readFileSync(file));
const dir = path.dirname(file);

const out = {};
for (const key of Object.keys(inFile)) {
  out[key] = {
    message: transFn(inFile[key].message),
  };
}

fs.writeFileSync(dir + path.sep + '/en-US-pseudo.json', JSON.stringify(out, null, 4));
