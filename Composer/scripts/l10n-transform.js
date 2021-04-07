// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const mapValues = require('lodash/mapValues');

const { transFn } = require('./l10nUtils');

const file = process.argv[2];

const inFile = JSON.parse(fs.readFileSync(file));
const dir = path.dirname(file);

const pseudo = mapValues(inFile, ({ message }) => ({ message: transFn(message) }));
const csv = Object.entries(inFile).map(([key, value]) => `${key},"${value.message.replace(/"/g, '""')}",`);

fs.writeFileSync(path.join(dir, '/en-US-pseudo.json'), JSON.stringify(pseudo, null, 4));
fs.writeFileSync(path.join(dir, '/en-US.csv'), csv.join('\n'));
