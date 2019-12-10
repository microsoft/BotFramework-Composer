// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { getExpressionProperties } from '../../src';

describe('extractExpressionDefinitions', () => {
  it('should return all expressions properties', () => {
    const schema = {
      definitions: {
        'Ms.type1': {
          anyOf: [
            {
              title: 'Type',
              required: ['condition'],
            },
          ],
          properties: {
            $type: {
              title: '$type',
            },
            $copy: {
              title: '$copy',
            },
            condition: {
              $role: 'expression',
            },
            items: {
              $role: 'expression',
            },
          },
        },
        'Ms.type2': {
          properties: {
            $type: {
              title: '$type',
            },
            items: {
              $role: 'expression',
            },
          },
        },
      },
    };
    expect(getExpressionProperties(schema)).toEqual({
      'Ms.type1': {
        properties: ['condition', 'items'],
        requiredTypes: {
          condition: true,
        },
      },
      'Ms.type2': {
        properties: ['items'],
        requiredTypes: {},
      },
    });
  });
});
