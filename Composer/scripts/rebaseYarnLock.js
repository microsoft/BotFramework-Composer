// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Usage:
//   cat yarn.lock | node rebaseYarnLock.js https://your-project.pkgs.visualstudio.com/_packaging/your-feed/npm/registry/ > new-yarn.lock

async function readAllStdin() {
  return new Promise((resolve, reject) => {
    const bufferList = [];
    let numBytes = 0;

    process.stdin.on('close', () => {
      resolve(Buffer.concat(bufferList, numBytes));
    });

    process.stdin.on('data', (buffer) => {
      bufferList.push(buffer);
      numBytes += buffer.length;
    });

    process.stdin.on('error', reject);
  });
}

async function main() {
  const baseURL = process.argv[2];

  if (!baseURL) {
    throw new Error('New registry base URL must be passed as first argument.');
  }

  // read in the yarn lock file
  const yarnLock = await readAllStdin();
  // convert from buffer to string
  const yarnContents = yarnLock.toString();

  // any time we see the default yarn registry URL, replace it with the specified registry URL
  const npmRegistryUrl = /https:\/\/registry\.yarnpkg\.com\//g;
  const rebasedYarnContents = yarnContents.replace(npmRegistryUrl, baseURL);

  // output new contents to stdout
  console.log(rebasedYarnContents);
}

main();
