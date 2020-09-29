// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';

import { getFieldsets } from '../getFieldsets';

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

describe('getFieldsets', () => {
  it('should return a single field set containing all the properties', () => {
    const uiOptions: any = {
      fieldsets: [{ title: 'set1' }],
    };

    const result = getFieldsets(schema, uiOptions, {});

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
    const uiOptions: any = {
      fieldsets: [
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

    const result = getFieldsets(schema, uiOptions, {});

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

  it('should include additional fields', () => {
    const uiOptions: any = {
      fieldsets: [
        {
          title: 'set1',
          fields: ['two', 'four', 'six'],
        },
        {
          title: 'set2',
          fields: ['*', 'additionalField'],
        },
      ],
      properties: {
        additionalField: {
          additionalField: true,
          field: 'field',
        },
      },
    };

    const result = getFieldsets(schema, uiOptions, {});

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
        uiOptions: {
          order: ['two', 'four', 'six'],
          properties: {},
        },
      }),
      expect.objectContaining({
        fields: ['one', 'three', 'five', 'seven', 'additionalField'],
        title: 'set2',
        schema: {
          properties: {
            one: { type: 'string' },
            three: { type: 'number' },
            five: { type: 'object' },
            seven: { type: 'boolean' },
          },
        },
        uiOptions: {
          order: ['one', 'three', 'five', 'seven', 'additionalField'],
          properties: { additionalField: { additionalField: true, field: 'field' } },
        },
      }),
    ]);
  });

  it('should throw an error for multiple wildcards', () => {
    const uiOptions: any = {
      fieldsets: [{ title: 'set1', fields: ['two', '*', 'six'] }, { title: 'set2' }],
    };

    expect(() => getFieldsets(schema, uiOptions, {})).toThrow('multiple wildcards');
  });

  it('should throw an error for missing fields', () => {
    const uiOptions = {
      fieldsets: [
        { title: 'set1', fields: ['two', 'four', 'six'] },
        { title: 'set2', fields: ['one'] },
      ],
    };

    expect(() => getFieldsets(schema, uiOptions, {})).toThrow('missing fields');
  });

  it('should throw an error for duplicate fields', () => {
    const uiOptions = {
      fieldsets: [
        { title: 'set1', fields: ['two', 'four', 'six'] },
        { title: 'set2', fields: ['two', '*'] },
      ],
    };

    expect(() => getFieldsets(schema, uiOptions, {})).toThrow('duplicate fields');
  });
});
