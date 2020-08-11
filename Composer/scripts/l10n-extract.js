// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');

const L10N_FIELDS = ['label', 'description', 'title', 'subtitle'];

function keep(obj, keptFields) {
  const out = {};
  for (const key of Object.keys(obj)) {
    if (keptFields.includes(key)) {
      out[key] = obj[key];
    }
    if (typeof obj[key] === 'object') {
      const value = keep(obj[key], keptFields);
      if (Object.keys(value).length === 0) continue;
      out[key] = value;
    }
  }
  return out;
}

const inFiles = process.argv.slice(2);

for (const file of inFiles) {
  let schema;
  const baseName = path.basename(file);
  const outputDir = path.join(path.normalize(path.dirname(file)), 'locales', 'en-US');
  console.log(file);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    schema = JSON.parse(fs.readFileSync(file));
  } catch (e) {
    console.error('No valid JSON file found');
    process.exit(1);
  }

  const output = keep(schema, L10N_FIELDS);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(outputDir + path.sep + baseName, JSON.stringify(output, null, 4));
}
