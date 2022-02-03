// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */

const { readFileSync, renameSync, writeFileSync } = require('fs');
const { join } = require('path');

// Usage:
//   node rebaseYarnLock.js https://your-project.pkgs.visualstudio.com/_packaging/your-feed/npm/registry/ yarn.lock

async function main() {
  const baseURL = process.argv[2];
  const src = process.argv[3];

  if (!baseURL) {
    throw new Error('New registry base URL must be passed as first argument.');
  }

  if (!src) {
    throw new Error('Source file path must be passed as the second argument.');
  }

  // read in the yarn lock file
  const yarnContents = readFileSync(src, { encoding: 'utf8' });
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
  writeFileSync(newFilePath, rebasedYarnContents);

  // overwrite existing file with new file
  renameSync(newFilePath, src);

  // output new contents to stdout for debugging
  console.log(rebasedYarnContents);
}

main();
