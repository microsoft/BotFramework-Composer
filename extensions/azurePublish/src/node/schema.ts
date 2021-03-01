// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@botframework-composer/types';

const schema: JSONSchema7 = {
  type: 'object',
  properties: {
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
    runtimeIdentifier: {
      type: 'string',
      title:
        'Runtime identifier for hosting bot, default to win-x64, please refer to https://docs.microsoft.com/en-us/dotnet/core/rid-catalog',
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
            containerId: {
              type: 'string',
            },
          },
          required: ['cosmosDBEndpoint', 'authKey', 'databaseId', 'containerId'],
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
  required: ['subscriptionID', 'publishName', 'provision'],
  default: {
    name: '<unique name in your subscription>',
    environment: 'dev',
    runtimeIdentifier: 'win-x64',
    settings: {
      applicationInsights: {
        InstrumentationKey: '<Instrumentation Key>',
      },
      cosmosDb: {
        cosmosDBEndpoint: '<endpoint url>',
        authKey: '<auth key>',
        databaseId: 'botstate-db',
        containerId: 'botstate-container',
      },
      blobStorage: {
        connectionString: '<connection string>',
        container: '<container>',
      },
      luis: {
        authoringKey: '',
        authoringEndpoint: '',
        endpointKey: '',
        endpoint: '',
        region: 'westus',
      },
      MicrosoftAppId: '<app id from Bot Framework registration>',
      MicrosoftAppPassword: '<app password from Bot Framework registration>',
    },
  },
};
export default schema;
