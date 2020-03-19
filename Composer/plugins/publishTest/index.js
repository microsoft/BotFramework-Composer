// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const publishMethod = {
  publish: async (config, project, user) => {
    console.log('PUBLISH ', config, user);
    return {
      status: 200,
      message: 'successfully published',
    }
  },
  getStatus: async config => {},
  history: async config => {},
  rollback: async (config, versionId) => {},
}

module.exports = {
  initialize: composer => {
    composer.addPublishMethod(publishMethod);
  }
};
