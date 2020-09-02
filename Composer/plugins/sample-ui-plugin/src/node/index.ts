// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// this will be called by composer
function initialize(registration) {
  const plugin = {
    customDescription: 'Publish using custom UI',
    hasView: true /** we have custom UI to host */,
    publish,
    getStatus,
  };
  registration.addPublishMethod(plugin);
}

async function getStatus(config, project, user) {
  const response = {
    status: 200,
    result: {
      time: new Date(),
      message: 'Publish successful.',
      log: [],
    },
  };
  return response;
}

async function publish(config, project, metadata, user) {
  const response = {
    status: 202,
    result: {
      time: new Date(),
      message: 'Publish accepted.',
      log: [],
      comment: metadata.comment,
    },
  };
  return response;
}

module.exports = {
  initialize,
};
