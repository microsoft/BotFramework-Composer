// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const schema = {
  type: 'object',
  properties: {
    dialogValue: {
      type: 'array',
      title: 'Dialog Value Schema',
      description: 'Dialog value schema.',
      $ref: '#/definitions/dialogProperties',
    },
    resultValue: {
      type: 'array',
      title: 'Dialog Result Schema',
      description: 'Dialog Result schema.',
      $ref: '#/definitions/dialogProperties',
    },
  },
  definitions: {
    dialogProperties: {
      items: {
        type: 'object',
        required: ['property'],
        properties: {
          property: {
            title: 'Property Name',
            type: 'string',
            description: 'Property name.',
          },
          value: {
            $role: 'expression',
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
      },
    },
  },
};
