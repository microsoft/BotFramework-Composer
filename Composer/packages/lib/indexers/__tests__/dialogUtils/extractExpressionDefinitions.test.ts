// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { extractExpressionDefinitions } from '../../src';

describe('extractExpressionDefinitions', () => {
  it('should return all expressions properties', () => {
    const schema = {
      definitions: {
        'Ms.type1': {
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
          },
        },
      },
    };
    expect(extractExpressionDefinitions(schema, 'definitions')).toEqual({ 'Ms.type1': ['condition', 'items'] });
    expect(extractExpressionDefinitions(schema, '')).toEqual({});
    expect(extractExpressionDefinitions(schema, 'definitions', [{ type: 'title', value: '$copy' }])).toEqual({
      'Ms.type1': ['$copy'],
    });
  });
});
