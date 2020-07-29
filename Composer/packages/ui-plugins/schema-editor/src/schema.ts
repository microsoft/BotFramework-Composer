// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/extension';
import formatMessage from 'format-message';

export const schema = (): JSONSchema7 => ({
  title: formatMessage('Dialog Schema'),
  type: 'object',
  properties: {
    dialogValue: {
      type: 'object',
      title: formatMessage('Input'),
      description: formatMessage('Dialog input schema.'),
      additionalProperties: {
        $ref: '#/definitions/dialogProperties',
      },
    },
    resultValue: {
      type: 'object',
      title: formatMessage('Output'),
      description: formatMessage('Dialog output schema.'),
      additionalProperties: {
        $ref: '#/definitions/dialogProperties',
      },
    },
  },
  definitions: {
    dialogProperties: {
      type: 'object',
      required: ['ref'],
      properties: {
        title: {
          type: 'string',
          title: formatMessage('Title'),
          description: formatMessage('Property title'),
        },
        description: {
          type: 'string',
          title: formatMessage('Description'),
          description: formatMessage('Property description.'),
        },
        ref: {
          type: 'string',
          title: formatMessage('Type'),
          description: formatMessage('Property description.'),
        },
      },
    },
  },
});
