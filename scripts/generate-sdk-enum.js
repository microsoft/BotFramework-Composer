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
const types = Object.keys(schema.definitions).reduce((all, defName) => {

  if (defName.startsWith('Microsoft.') && !defName.startsWith('Microsoft.Test')) {
    all.push(defName);
  }

  return all;
}, []);
let uType = 'export enum SDKKinds {\n';
uType += types.map(t => `  ${t.replace('Microsoft.', '').replace('.', '')} = '${t}',`).join('\n');
uType += '\n}';
console.log(uType);
