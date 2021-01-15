// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

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
const outputTransformed = keep(output, L10N_FIELDS, transFn);
const uiOutputTransformed = keep(uiOutput, L10N_FIELDS, transFn);
const outputFilename = path.join(schemaDir, 'sdk.en-US.schema');
const outputFilenameTrans = path.join(schemaDir, 'sdk.en-US-pseudo.schema');
const uiOutputFilename = path.join(schemaDir, 'sdk.en-US.uischema');
const uiOutputFilenameTrans = path.join(schemaDir, 'sdk.en-US-pseudo.uischema');

console.log('writing', outputFilename);
fs.writeFileSync(outputFilename, JSON.stringify(output, null, 4));
console.log('writing', outputFilenameTrans);
fs.writeFileSync(outputFilenameTrans, JSON.stringify(outputTransformed, null, 4));
console.log('writing', uiOutputFilename);
fs.writeFileSync(uiOutputFilename, JSON.stringify(uiOutput, null, 4));
console.log('writing', uiOutputFilenameTrans);
fs.writeFileSync(uiOutputFilenameTrans, JSON.stringify(uiOutputTransformed, null, 4));
