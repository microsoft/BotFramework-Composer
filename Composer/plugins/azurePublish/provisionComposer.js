// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const fs = require('fs-extra');
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
const Deploy = require('@bfc/libs/bot-deploy');
const argv = require('minimist')(process.argv.slice(2));

const path = require('path');

const hash = require('uuid').v5;

msRestNodeAuth
  .interactiveLogin()
  .then(async creds => {
    const subId = argv.subscriptionId;
    const name = argv.name;
    const environment = argv.environment || 'dev';
    const location = argv.location || 'westus';
    const appPassword = argv.appPassword;
    const luisAuthoringKey = argv.luisAuthoringKey;
    const luisAuthoringRegion = argv.luisAuthoringRegion || 'westus';
    const key = hash([name, location, environment, appPassword, luisAuthoringKey, luisAuthoringRegion], subId);
    const projFolder = argv.projFolder || path.resolve(__dirname, `publishBots/${key}`);
    const config = {
      subId: subId,
      creds: creds,
      projPath: projFolder,
      logger: msg => console.log(msg),
    };

    const publisher = new Deploy.BotProjectDeploy(config);
    const createResult = await publisher.create(name, location, environment, appPassword, luisAuthoringKey);
    if (createResult) {
      console.log(
        `Your Azure hosting environment has been created! Copy paste the following configuration into a new profile in Composer's Publishing tab.`
      );

      const profile = {
        publishName: name,
        location: location,
        subscriptionID: subId,
        appPassword: appPassword,
        luisAuthoringKey: luisAuthoringKey,
        luisAuthoringRegion: luisAuthoringRegion,
        environment: environment,
        provision: createResult,
        accessToken: await creds.getToken().accessToken,
        // TODO: remove this when we figure out how to use accessToken only
        credential: creds,
      };

      console.log(JSON.stringify(profile, null, 2));
    }
  })
  .catch(err => {
    console.error(err);
  });
