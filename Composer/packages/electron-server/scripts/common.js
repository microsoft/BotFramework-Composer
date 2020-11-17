// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

/** Hashes a file asynchronously */
const path = require('path');
const fsp = require('fs-extra');
const yaml = require('js-yaml');
const fs = require('fs');
const crypto = require('crypto');
const packageJson = require('../package.json');

async function writeToDist(err, files, fileName) {
  if (err) {
    console.log('Installer file is missing.');
    return;
  }
  const version = packageJson.version;
  const releasePath = files[0];
  const releaseFileName = path.basename(releasePath);
  const sha512 = await hashFileAsync(path.normalize(releasePath));
  const releaseDate = new Date().toISOString();
  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFileName,
    path: releaseFileName,
    sha512,
  };
  const ymlStr = yaml.safeDump(ymlInfo);
  const ymlPath = path.join(__dirname, `../dist/${fileName}`);
  fsp.writeFileSync(ymlPath, ymlStr);
}

// https://github.com/electron-userland/electron-builder/issues/3913 as hashFilAsync has been removed from latest electron-builder
function hashFileAsync(file, algorithm = 'sha512', encoding = 'base64', options) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    hash.on('error', reject).setEncoding(encoding);
    fs.createReadStream(
      file,
      Object.assign({}, options, {
        highWaterMark: 1024 * 1024,
        /* better to use more memory but hash faster */
      })
    )
      .on('error', reject)
      .on('end', () => {
        hash.end();
        console.log('hash done');
        resolve(hash.read());
      })
      .pipe(hash, {
        end: false,
      });
  });
}

const scriptName = path.basename(process.argv[1]);
function logInfo(...args) {
  const [formatter, ...rest] = args;
  console.log(`[${scriptName}] ${formatter}`, ...rest);
}

function logError(...args) {
  const [formatter, ...rest] = args;
  console.error(`[${scriptName}] ${formatter}`, ...rest);
}

module.exports = {
  hashFileAsync,
  writeToDist,
  log: {
    info: logInfo,
    error: logError,
  },
};
