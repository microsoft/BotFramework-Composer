/**
 * In a production environment (abs-h, docker), we need all dependencies to be co-located in the server node_modules.
 * In development, yarn workspaces allows us to develop local packages simultaneously via symlinks,
 * but on a production machine, we cannot use yarn workspaces and need to run `npm install --production`
 * which is unable to resolve our local modules (i.e. @bfc/shared).
 */

const fs = require('fs');
const path = require('path');
const packagesDir = process.argv[2] || path.resolve(__dirname, '..');

const packageJsonPath = path.resolve(__dirname, 'package.json');

function getInstallPath(scope, name) {
  const data = require(path.resolve(packagesDir, `./lib/${name}/package.json`));
  const tgzName = `${scope}-${name}-${data.version}.tgz`;
  const tgzPath = path.resolve(packagesDir, `./lib/${name}`, tgzName);
  const childPath = path.resolve(__dirname, `./lib/${name}`);
  const childInstallPath = fs.existsSync(childPath) ? childPath : null;
  const tgzInstallPath = fs.existsSync(tgzPath) ? tgzPath : null;
  return { [`@${scope}/${name}`]: childInstallPath || tgzInstallPath };
}

const localPackages = {
  ...getInstallPath('bfc', 'indexers'),
  ...getInstallPath('bfc', 'shared'),
};

const packageJson = require(packageJsonPath);

packageJson.dependencies = { ...packageJson.dependencies, ...localPackages };

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
