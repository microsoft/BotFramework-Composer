// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@bfc/plugin-loader';
const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
    },
    name: {
      type: 'string',
      title: 'name',
    },
    environment: {
      type: 'string',
      title: 'Environment',
    },
    hostname: {
      type: 'string',
      title: 'Custom webapp hostname (if not <name>-<env>)',
    },
    luisResource: {
      type: 'string',
      title: 'Custom luis resource name (if not <name>-<env>-luis)',
    },
    language: {
      type: 'string',
      title: 'Language for luis - default to en-us',
    },
    settings: {
      type: 'object',
      title: 'Settings for Azure resources',
      properties: {
        applicationInsights: {
          type: 'object',
          properties: {
            InstrumentationKey: {
              type: 'string',
            },
          },
        },
        cosmosDb: {
          type: 'object',
          properties: {
            cosmosDBEndpoint: {
              type: 'string',
            },
            authKey: {
              type: 'string',
            },
            databaseId: {
              type: 'string',
            },
            collectionId: {
              type: 'string',
            },
            containerId: {
              type: 'string',
            },
          },
          required: ['cosmosDBEndpoint', 'authKey', 'databaseId', 'collectionId', 'containerId'],
        },
        blobStorage: {
          type: 'object',
          properties: {
            connectionString: {
              type: 'string',
            },
            container: {
              type: 'string',
            },
          },
          required: ['connectionString', 'container'],
        },
        luis: {
          type: 'object',
          properties: {
            endpoint: {
              type: 'string',
            },
            authoringEndpoint: {
              type: 'string',
            },
            endpointKey: {
              type: 'string',
            },
            authoringKey: {
              type: 'string',
            },
            region: {
              type: 'string',
            },
          },
          required: ['endpointKey', 'authoringKey', 'region'],
        },
        MicrosoftAppId: {
          type: 'string',
        },
        MicrosoftAppPassword: {
          type: 'string',
        },
      },
      required: ['MicrosoftAppId', 'MicrosoftAppPassword'],
    },
  },
  required: ['subscriptionID', 'publishName', 'provision', 'accessToken'],
  default: {
    accessToken: '<Access token from az account get-access-token>',
    name: '<unique name in your subscription>',
    environment: 'dev',
    settings: {
      applicationInsights: {
        InstrumentationKey: '<Instrumentation Key>',
      },
      cosmosDb: {
        cosmosDBEndpoint: '<endpoint url>',
        authKey: '<auth key>',
        databaseId: 'botstate-db',
        collectionId: 'botstate-collection',
        containerId: 'botstate-container',
      },
      blobStorage: {
        connectionString: '<connection string>',
        container: '<container>',
      },
      luis: {
        authoringKey: '<authoring key>',
        authoringEndpoint: '',
        endpointKey: '<endpoint key>',
        endpoint: '',
        region: 'westus',
      },
      MicrosoftAppId: '<app id from Bot Framework registration>',
      MicrosoftAppPassword: '<app password from Bot Framework registration>',
    },
  },
};
export default schema;
