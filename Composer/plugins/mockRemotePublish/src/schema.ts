// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/plugin-loader';

const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      title: 'Authentication Token',
      examples: ['<your token>'],
    },
    endpointUrl: {
      type: 'string',
      title: 'Endpoint URL',
      examples: ['http://localhost:3979/api/messages'],
    },
    botId: {
      type: 'string',
      title: 'Bot ID',
    },
  },
  default: {
    token: '<your token>',
    endpointUrl: 'http://localhost:3979/api/messages',
    botId: 'MyBot',
  },
};

export default schema;
