// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const glob = require('glob');

const common = require('./common.js');
const { writeToDist } = common;

writeLatestYmlFile().catch((e) => console.error(e));
/** Generates latest-mac.yml */
async function writeLatestYmlFile() {
  glob('../**/BotFramework-Composer*-mac.zip', {}, (err, files) => writeToDist(err, files, 'latest-mac.yml'));
}
