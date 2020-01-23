// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  initialize: composer => {
    composer.addPublishMethod(this);
  },
  publish: async (config, project) => {
    console.log('PUBLISH ', config);
  },
  getStatus: async config => {},
  history: async config => {},
  rollback: async config => {},
};
