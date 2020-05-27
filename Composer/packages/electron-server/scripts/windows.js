// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

const glob = require('glob');
const common = require('./common.js');
const { writeToDist } = common;

writeLatestYmlFile().catch((e) => console.error(e));
/** Generates latest-mac.yml */
async function writeLatestYmlFile() {
  glob('../**/*.exe', {}, (err, files) => writeToDist(err, files, 'latest.yml'));
}
