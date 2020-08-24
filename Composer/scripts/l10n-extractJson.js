// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const merge = require('lodash/merge');

const { keep, transFn } = require('./l10nUtils');

const L10N_FIELDS = ['label', 'description', 'title', 'subtitle'];

const inDir = process.argv[2];

let schema, uiSchema;
const outputDir = path.join(path.normalize(inDir), 'locales', 'en-US');
const outputDirTrans = path.join(path.normalize(inDir), 'locales', 'en-US-pseudo');
/* eslint-disable security/detect-non-literal-fs-filename */
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(outputDirTrans, { recursive: true });
/* eslint-enable */

try {
  /* eslint-disable security/detect-non-literal-fs-filename */
  schema = JSON.parse(fs.readFileSync(inDir + path.sep + 'sdk.schema'));
  uiSchema = JSON.parse(fs.readFileSync(inDir + path.sep + 'sdk.uischema'));
} catch (e) {
  console.error('No valid JSON file found');
  process.exit(1);
}

const output = keep(schema, L10N_FIELDS);
const uiOutput = keep(uiSchema, L10N_FIELDS);
const outputTransformed = keep(merge(output, uiOutput), L10N_FIELDS, transFn);
const outputFn = outputDir + path.sep + 'sdk.overrides.schema';
const outputFnTrans = outputDirTrans + path.sep + 'sdk.overrides.schema';

console.log('writing', outputFn);
fs.writeFileSync(outputFn, JSON.stringify(keep(merge(output, uiOutput), L10N_FIELDS), null, 4));
console.log('writing', outputFnTrans);
fs.writeFileSync(outputFnTrans, JSON.stringify(outputTransformed, null, 4));
