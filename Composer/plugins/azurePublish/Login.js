// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');

const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
// const Deploy = require('@bfc/libs/bot-deploy');
msRestNodeAuth
  .interactiveLogin()
  .then(creds => {
    // const subId;
    // const projFolder;
    // const name;
    // const environment;
    // const location;
    // const appPassword;
    // const config
    // new Deploy.BotProjectDeploy();
    const result = JSON.stringify(creds);
    fs.writeFileSync('cred.txt', result);
  })
  .catch(err => {
    console.error(err);
  });
