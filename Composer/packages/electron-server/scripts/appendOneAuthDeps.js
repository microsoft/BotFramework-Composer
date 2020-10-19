const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJsonContents = readFileSync(packageJsonPath);
const packageJson = JSON.parse(packageJsonContents);
packageJson.dependencies = {
  ...packageJson.dependencies,
  'oneauth-win64': '1.11.0',
};
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
