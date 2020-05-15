// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dereference, dereferenceDefinitions } from '../../src/schemaUtils/dereference';
import { SchemaDefinitions } from '../../src/schemaUtils/types';

const defs: SchemaDefinitions = {
  'Microsoft.IDialog': {
    oneOf: [
      {
        $ref: '#/definitions/Microsoft.Foo',
      },
      {
        $ref: '#/definitions/Microsoft.Bar',
      },
    ],
  },
  'Microsoft.Foo': {
    properties: {
      actions: {
        type: 'array',
        items: {
          $ref: '#/definitions/Microsoft.IDialog',
        },
      },
    },
  },
  'Microsoft.Bar': {
    properties: {
      name: {
        title: 'name',
        type: 'string',
      },
      num: {
        title: 'num',
        oneOf: [
          {
            title: 'float',
            $ref: '#/definitions/num',
          },
          {
            type: 'integer',
          },
        ],
      },
    },
  },
  num: {
    type: 'number',
  },
};

describe('dereference', () => {
  const cache = new Map();

  it('dereferences arrays and object', () => {
    const result = dereference(defs['Microsoft.Bar'], defs, cache);
    expect(result).toEqual({
      properties: {
        name: {
          title: 'name',
          type: 'string',
        },
        num: {
          title: 'num',
          oneOf: [
            {
              title: 'float',
              type: 'number',
            },
            {
              type: 'integer',
            },
          ],
        },
      },
    });
  });

  it('does not dereference circular refs', () => {
    const result = dereference(defs['Microsoft.IDialog'], defs, cache);
    expect(result).toEqual({
      oneOf: [
        {
          properties: {
            actions: {
              type: 'array',
              items: {
                $ref: '#/definitions/Microsoft.IDialog',
              },
            },
          },
        },
        {
          properties: {
            name: {
              title: 'name',
              type: 'string',
            },
            num: {
              title: 'num',
              oneOf: [
                {
                  title: 'float',
                  type: 'number',
                },
                {
                  type: 'integer',
                },
              ],
            },
          },
        },
      ],
    });
  });
});

describe('dereferenceDefinitions', () => {
  it('dereferences all definitions except ones with circular refs', () => {
    expect(dereferenceDefinitions(defs)).toEqual({
      'Microsoft.IDialog': {
        oneOf: [
          {
            $ref: '#/definitions/Microsoft.Foo',
          },
          {
            $ref: '#/definitions/Microsoft.Bar',
          },
        ],
      },
      'Microsoft.Foo': {
        properties: {
          actions: {
            type: 'array',
            items: {
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
      },
      'Microsoft.Bar': {
        properties: {
          name: {
            title: 'name',
            type: 'string',
          },
          num: {
            title: 'num',
            oneOf: [
              {
                title: 'float',
                type: 'number',
              },
              {
                type: 'integer',
              },
            ],
          },
        },
      },
      num: {
        type: 'number',
      },
    });
  });
});
