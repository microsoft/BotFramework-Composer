// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs');
const { join, resolve } = require('path');

// Usage:
//   node rebaseExtensionYarnLocks.js https://your-project.pkgs.visualstudio.com/_packaging/your-feed/npm/registry/

async function main() {
  const baseURL = process.argv[2];

  if (!baseURL) {
    throw new Error('New registry base URL must be passed as first argument.');
  }

  console.log('Rebasing extension yarn.lock files...');

  // get a list of all the extension folders
  const extensionsDir = resolve(__dirname, '..');
  const ignoredDirs = ['scripts', 'node_modules'];
  const allExtensions = fs
    .readdirSync(extensionsDir, { withFileTypes: true })
    .filter((ent) => !ignoredDirs.includes(ent.name));

  // run the rebase script for every extension
  for (const extDir of allExtensions) {
    if (extDir.isDirectory()) {
      const src = join(extensionsDir, extDir.name, 'yarn.lock');

      if (!fs.existsSync(src)) {
        // no yarn lock file, skip this extension
        console.log(`No lock file found for extension ${extDir}, skipping to next extension.`);
        continue;
      }

      // read in the yarn lock file
      const yarnContents = fs.readFileSync(src, { encoding: 'utf8' });
      if (!yarnContents) {
        throw new Error(`Provided source file path ${src} is empty.`);
      }

      // any time we see the default yarn registry URL, replace it with the specified registry URL
      const npmRegistryUrl = /https:\/\/registry\.yarnpkg\.com\//g;
      const rebasedYarnContents = yarnContents.replace(npmRegistryUrl, baseURL);

      if (npmRegistryUrl.test(rebasedYarnContents)) {
        throw new Error('Yarn registry URL was not successfully purged from the specified yarn.lock file.');
      }

      // write new contents to a new file
      const newFilePath = join(__dirname, `tempYarn-${Date.now()}.lock`);
      fs.writeFileSync(newFilePath, rebasedYarnContents);

      // overwrite existing file with new file
      fs.renameSync(newFilePath, src);

      // output new contents to stdout for debugging
      console.log(rebasedYarnContents);
    }
  }

  console.log('Finished rebasing extension yarn.lock files.');
}

main();
