// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const schema = {
  type: 'object',
  properties: {
    subscriptionID: {
      type: 'string',
      title: 'Subscription ID',
      examples: ['<your subscription id>'],
    },
    appPassword: {
      type: 'string',
      title: 'App Password',
    },
    name: {
      type: 'string',
      title: 'Name',
    },
    environment: {
      type: 'string',
      title: 'Environment',
    },
    location: {
      type: 'string',
      title: 'Location',
    },
    luisAuthoringRegion: {
      type: 'string',
      title: 'region',
    },
    luisAuthoringKey: {
      type: 'string',
      title: 'Authoring Key',
    },
    // graphToken: {
    //   type: 'string',
    //   title: 'graph token',
    // },
    // accessToken: {
    //   type: 'string',
    //   title: 'access token',
    // },
    isCreate: {
      type: 'boolean',
      title: 'Azure Resource Create or not',
    },
  },
  default: {
    subscriptionID: '<your subscription id>',
    appPassword: '<16 characters including uppercase, lowercase, number and special character>',
    name: '<unique name in your subscription>',
    environment: 'composer',
    location: 'westus',
    luisAuthoringRegion: 'westus',
    luisAuthoringKey: '',
    isCreate: false,
    graphToken:
      '<run az account get-access-token --resource-type aad-graph in command line and replace it with accessToken>',
    accessToken: '<run az account get-access-token in command line and replace it with accessToken>',
  },
};
