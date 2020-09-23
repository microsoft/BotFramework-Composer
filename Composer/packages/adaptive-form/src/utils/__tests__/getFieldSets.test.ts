// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';

import { getFieldSets } from '../getFieldSets';

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

describe('getFieldSets', () => {
  it('should return a single field set containing all the properties', () => {
    const uiOptions = {
      fieldSets: [{ title: 'set1' }],
    };

    const result = getFieldSets(schema, uiOptions, {});

    expect(result).toEqual([
      expect.objectContaining({
        fields: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
        schema: {
          properties: {
            one: { type: 'string' },
            two: { type: 'string' },
            three: { type: 'number' },
            four: { type: 'object' },
            five: { type: 'object' },
            six: { type: 'object' },
            seven: { type: 'boolean' },
          },
        },
        title: 'set1',
      }),
    ]);
  });

  it('should return two sets', () => {
    const uiOptions = {
      fieldSets: [
        {
          title: 'set1',
          fields: ['two', 'four', 'six'],
        },
        {
          title: 'set2',
          fields: ['*'],
        },
      ],
    };

    const result = getFieldSets(schema, uiOptions, {});

    expect(result).toEqual([
      expect.objectContaining({
        fields: ['two', 'four', 'six'],
        title: 'set1',
        schema: {
          properties: {
            two: { type: 'string' },
            four: { type: 'object' },
            six: { type: 'object' },
          },
        },
      }),
      expect.objectContaining({
        fields: ['one', 'three', 'five', 'seven'],
        title: 'set2',
        schema: {
          properties: {
            one: { type: 'string' },
            three: { type: 'number' },
            five: { type: 'object' },
            seven: { type: 'boolean' },
          },
        },
      }),
    ]);
  });

  it('should throw an error for multiple wildcards', () => {
    const uiOptions = {
      fieldSets: [{ title: 'set1', fields: ['two', '*', 'six'] }, { title: 'set2' }],
    };

    expect(() => getFieldSets(schema, uiOptions, {})).toThrow('multiple wildcards');
  });

  it('should throw an error for missing fields', () => {
    const uiOptions = {
      fieldSets: [
        { title: 'set1', fields: ['two', 'four', 'six'] },
        { title: 'set2', fields: ['one'] },
      ],
    };

    expect(() => getFieldSets(schema, uiOptions, {})).toThrow('missing fields');
  });

  it('should throw an error for duplicate fields', () => {
    const uiOptions = {
      fieldSets: [
        { title: 'set1', fields: ['two', 'four', 'six'] },
        { title: 'set2', fields: ['two', '*'] },
      ],
    };

    expect(() => getFieldSets(schema, uiOptions, {})).toThrow('duplicate fields');
  });
});
