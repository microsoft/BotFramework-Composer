// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const { keep, transFn } = require('./l10nUtils');

const L10N_FIELDS = ['label', 'description', 'title', 'subtitle'];

const inFiles = process.argv.slice(2);

for (const file of inFiles) {
  let schema;
  const baseName = path.basename(file);
  const outputDir = path.join(path.normalize(path.dirname(file)), 'locales', 'en-US');
  const outputDirTrans = path.join(path.normalize(path.dirname(file)), 'locales', 'en-US-pseudo');
  /* eslint-disable security/detect-non-literal-fs-filename */
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(outputDirTrans, { recursive: true });
  /* eslint-enable */

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    schema = JSON.parse(fs.readFileSync(file));
  } catch (e) {
    console.error('No valid JSON file found');
    process.exit(1);
  }

  const output = keep(schema, L10N_FIELDS);
  const outputTransformed = keep(schema, L10N_FIELDS, transFn);
  const outputFn = outputDir + path.sep + baseName;

  console.log('writing', outputFn);
  /* eslint-disable security/detect-non-literal-fs-filename */
  fs.writeFileSync(outputDir + path.sep + baseName, JSON.stringify(output, null, 4));
  fs.writeFileSync(outputDirTrans + path.sep + baseName, JSON.stringify(outputTransformed, null, 4));
}
