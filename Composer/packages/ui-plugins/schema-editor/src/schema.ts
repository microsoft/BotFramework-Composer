// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/extension';

export const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    dialogValue: {
      type: 'object',
      title: 'Dialog Value Schema',
      description: 'Dialog value schema.',
      additionalProperties: {
        $ref: '#/definitions/dialogProperties',
      },
    },
    resultValue: {
      type: 'object',
      title: 'Dialog Result Schema',
      description: 'Dialog Result schema.',
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
          title: 'Title',
          description: 'Property title',
        },
        description: {
          type: 'string',
          title: 'Description',
          description: 'Property description.',
        },
        ref: {
          type: 'string',
          title: 'Type',
          description: 'Property description.',
        },
      },
    },
  },
};
