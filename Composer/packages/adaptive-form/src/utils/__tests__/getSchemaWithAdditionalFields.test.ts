// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';

import { getSchemaWithAdditionalFields } from '../getSchemaWithAdditionalFields';

const schema = {
  properties: {
    one: { type: 'string' },
    two: { type: 'string' },
    three: { type: 'number' },
    four: { type: 'object' },
    five: { type: 'object' },
    six: { type: 'object' },
    seven: { type: 'boolean' },
    $kind: { type: 'string' },
  },
} as JSONSchema7;

describe('getSchemaWithAdditionalFields', () => {
  it('should add additional fields to schema', () => {
    const uiOptions: any = {
      properties: {
        additionalField: {
          additionalField: true,
          field: 'field',
        },
      },
    };

    const result = getSchemaWithAdditionalFields(schema, uiOptions);
    expect(result).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          additionalField: {},
        }),
      })
    );
  });
});
