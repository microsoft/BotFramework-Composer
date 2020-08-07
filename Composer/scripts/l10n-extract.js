// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');

let schema;
const fileName = process.argv[2];

try {
  schema = JSON.parse(fs.readFileSync(fileName));
} catch (e) {
  console.error('No valid JSON file found');
  process.exit(1);
}

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

fs.writeFileSync(fileName + '.en-US.json', JSON.stringify(keep(schema, L10N_FIELDS), null, 4));
