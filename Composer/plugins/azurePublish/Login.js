// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');

const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
msRestNodeAuth
  .interactiveLogin()
  .then(creds => {
    // const result = JSON.stringify(creds);
    // fs.writeFileSync('cred.txt', result);
    console.log(`parse this into profile`);
    console.log(creds);
  })
  .catch(err => {
    console.error(err);
  });
