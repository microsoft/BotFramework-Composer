const fs = require('fs');
const path = require('path');

const showHelp = process.argv.includes('--help');

if (showHelp) {
  const help = `Run this script when the schema updates to generate an enum
which includes all of the types in the schema.

Usage:
  node scripts/generate-sdk-enum.js
  node scripts/generate-sdk-enum.js /path/to/schema
`;

  console.log(help);
  process.exit(0);
}

const schemaPath = process.argv[2] || path.resolve(__dirname, '../runtime/dotnet/azurewebapp/schemas/sdk.schema');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const types = schema.oneOf.reduce((all, t) => {
  const ref = schema.definitions[t.$ref.replace('#/definitions/', '')];
  const $kind = ref && ref.properties && ref.properties.$kind && ref.properties.$kind.const;
  if ($kind) {
    all.push($kind);
  }

  return all;
}, []);
let uType = 'export enum SDKKinds {\n';
uType += types.map(t => `  ${t.replace('Microsoft.', '').replace('.', '')} = '${t}',`).join('\n');
uType += '\n}';
console.log(uType);
