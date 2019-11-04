/**
 * In a production environment (abs-h, docker), we need all dependencies to be co-located in the server node_modules.
 * In development, yarn workspaces allows us to develop local packages simultaneously via symlinks,
 * but on a production machine, we cannot use yarn workspaces and need to run `npm install --production`
 * which is unable to resolve our local modules (i.e. @bfc/shared).
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, 'package.json');

const localPackages = {
  '@bfc/indexers': path.resolve(__dirname, './lib/indexers'),
  '@bfc/shared': path.resolve(__dirname, './lib/shared'),
};

const packageJson = require(packageJsonPath);

Object.keys(localPackages).forEach(p => {
  packageJson.dependencies[p] = localPackages[p];
});

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
