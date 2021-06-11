// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@botframework-composer/types';

// TODO: remove this code eventually, added it so that extension would successfully build

function initialize(registration: IExtensionRegistration) {
  const plugin1 = {
    name: 'azurePublishNew',
    description: 'Publish bot to Azure - new',
    bundleId: 'publish' /** we have custom UI to host */,
    publish,
    getStatus,
  };
  registration.addPublishMethod(plugin1);

  // test reading and writing data
  registration.log('Reading from store:\n%O', registration.store.readAll());

  registration.store.replace({ some: 'data' });
  registration.log('Reading from store:\n%O', registration.store.readAll());
}

async function getStatus(config, project, user) {
  const response = {
    status: 200,
    result: {
      time: new Date().toString(),
      message: 'Publish successful.',
      log: '',
    },
  };
  return response;
}

async function publish(config, project, metadata, user) {
  const response = {
    status: 202,
    result: {
      time: new Date().toString(),
      message: 'Publish accepted.',
      log: '',
      comment: metadata.comment,
    },
  };
  return response;
}

module.exports = {
  initialize,
};
