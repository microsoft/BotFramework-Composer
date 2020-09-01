// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const merge = require('lodash/merge');

const { keep, transFn } = require('./l10nUtils');

const L10N_FIELDS = ['label', 'description', 'title', 'subtitle'];

const schemaDir = process.argv[2];

let schema, uiSchema;

try {
  /* eslint-disable security/detect-non-literal-fs-filename */
  schema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'sdk.schema')));
  uiSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'sdk.uischema')));
} catch (e) {
  console.error('No valid JSON file found');
  process.exit(1);
}

const output = keep(schema, L10N_FIELDS);
const uiOutput = keep(uiSchema, L10N_FIELDS);
const outputTransformed = keep(merge(output, uiOutput), L10N_FIELDS, transFn);
const outputFn = path.join(schemaDir, 'sdk.en-US.uischema');
const outputFnTrans = path.join(schemaDir, 'sdk.en-US-pseudo.uischema');

console.log('writing', outputFn);
fs.writeFileSync(outputFn, JSON.stringify(keep(merge(output, uiOutput), L10N_FIELDS), null, 4));
console.log('writing', outputFnTrans);
fs.writeFileSync(outputFnTrans, JSON.stringify(outputTransformed, null, 4));
