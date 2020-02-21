// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema4 } from 'json-schema';

import { getOrderedProperties } from '../getOrderedProperties';

const schema = {
  properties: {
    one: { type: 'string' },
    two: { type: 'string' },
    three: { type: 'number' },
    four: { type: 'object' },
    $kind: { type: 'string' },
  },
} as JSONSchema4;
const data = 'form data';

describe('getOrderedProperties', () => {
  it('excludes fields according to hidden option', () => {
    const expectedResult = ['one', 'three', 'four'];

    expect(getOrderedProperties(schema, { hidden: ['two'], order: ['two', '*'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { hidden: () => ['two'], order: ['two', '*'] }, data)).toEqual(expectedResult);
  });

  it('sorts according to order option', () => {
    const expectedResult = ['three', 'one', 'four', 'two'];

    expect(getOrderedProperties(schema, { order: ['three', '*', 'two'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { order: () => ['three', '*', 'two'] }, data)).toEqual(expectedResult);
  });

  it("excludes fields that don't exist in the schema", () => {
    const expectedResult = ['three', 'one', 'four', 'two'];

    expect(getOrderedProperties(schema, { order: ['three', '*', 'two', 'five'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { order: () => ['three', '*', 'two', 'five'] }, data)).toEqual(expectedResult);
  });

  it('throws an exception if there is no wildcard in order option', () => {
    expect(() => getOrderedProperties(schema, { order: ['three', 'two'] }, data)).toThrow('no wildcard');
  });

  it('throws an exception if there are multiple wildcards in order option', () => {
    expect(() => getOrderedProperties(schema, { order: ['three', '*', 'two', '*'] }, data)).toThrow(
      'multiple wildcards'
    );
  });
});
