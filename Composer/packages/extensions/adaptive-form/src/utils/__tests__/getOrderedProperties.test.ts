// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';

import { getOrderedProperties } from '../getOrderedProperties';

const schema = {
  properties: {
    one: { type: 'string' },
    two: { type: 'string' },
    three: { type: 'number' },
    four: { type: 'object' },
    five: { type: 'object' },
    six: { type: 'object' },
    $kind: { type: 'string' },
  },
} as JSONSchema7;
const data = 'form data';

describe('getOrderedProperties', () => {
  it('excludes fields according to hidden option', () => {
    const expectedResult = ['one', 'three', 'four', ['five', 'six']];

    expect(getOrderedProperties(schema, { hidden: ['two'], order: ['two', '*', ['five', 'six']] }, data)).toEqual(
      expectedResult
    );

    expect(getOrderedProperties(schema, { hidden: () => ['two'], order: ['two', '*', ['five', 'six']] }, data)).toEqual(
      expectedResult
    );
  });

  it('sorts according to order option', () => {
    const expectedResult = ['three', 'one', 'four', 'five', 'six', 'two'];

    expect(getOrderedProperties(schema, { order: ['three', '*', 'two'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { order: () => ['three', '*', 'two'] }, data)).toEqual(expectedResult);
  });

  it("excludes fields that don't exist in the schema", () => {
    const expectedResult = ['three', 'one', 'four', 'five', 'six', 'two'];

    expect(getOrderedProperties(schema, { order: ['three', '*', 'two', 'seven'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { order: () => ['three', '*', 'two', 'seven'] }, data)).toEqual(expectedResult);
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
