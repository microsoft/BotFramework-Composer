// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
const fs = require('fs');
const path = require('path');

function getBuildEnvironment() {
  return {
    QNA_SUBSCRIPTION_KEY: process.env.QNA_SUBSCRIPTION_KEY,
    APPINSIGHTS_INSTRUMENTATIONKEY: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  };
}

async function writeToDist(fileName) {
  const envPath = path.join(__dirname, `../build/${fileName}`);
  const output = getBuildEnvironment();
  fs.writeFileSync(envPath, JSON.stringify(output));
}

writeToDist('env.json');
