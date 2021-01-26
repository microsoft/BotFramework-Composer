// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
const path = require('path');
const fs = require('fs-extra');

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

//copy monaco editor resouce to public folder to support offline usage
const monacoEditor = path.resolve(__dirname, '../../../node_modules/monaco-editor/min');
const monacoEditorInPublicFolder = path.resolve(__dirname, '../../client/public/min');
fs.copy(monacoEditor, monacoEditorInPublicFolder, function (err) {
  if (err) {
    console.log('An error occured while copying monaco-editor resource to public folder.');
    return console.error(err);
  }
});

//copy fabric fonts to public folder to support offline usage
const fabricFonts = path.resolve(__dirname, '../../../node_modules/@uifabric/icons/fonts');
const fabricFontsInPublicFolder = path.resolve(__dirname, '../../client/public/fonts');
fs.copy(fabricFonts, fabricFontsInPublicFolder, function (err) {
  if (err) {
    console.log('An error occured while copying fabric fonts resource to public folder.');
    return console.error(err);
  }
});
