//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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
  fsp.writeFileSync(path.normalize(`../dist/${fileName}`), ymlStr);
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

module.exports = {
  hashFileAsync,
  writeToDist,
};
