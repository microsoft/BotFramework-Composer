// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');

const { transFn } = require('./l10nUtils');

const inFile = JSON.parse(fs.readFileSync('packages/client/locales/en-US.json'));

const out = {};
for (const key of Object.keys(inFile)) {
  out[key] = {
    message: transFn(inFile[key].message),
  };
}

fs.writeFileSync('packages/client/locales/en-US-pseudo.json', JSON.stringify(out, null, 4));
