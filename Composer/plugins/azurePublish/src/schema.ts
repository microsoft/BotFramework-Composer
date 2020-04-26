// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@bfc/plugin-loader';
const schema: JSONSchema7 = {
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
  },
  default: {
    subscriptionID: '<your subscription id>',
    appPassword: '<16 characters including uppercase, lowercase, number and special character>',
    name: '<unique name in your subscription>',
    environment: 'dev',
    location: 'westus',
    luisAuthoringRegion: 'westus',
    luisAuthoringKey: '',
  },
};
export default schema;
