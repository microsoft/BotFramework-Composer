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
    seven: { type: 'boolean' },
    $kind: { type: 'string' },
  },
} as JSONSchema7;
const data = 'form data';

describe('getOrderedProperties', () => {
  it('includes hidden fields', () => {
    expect(getOrderedProperties(schema, { hidden: ['two'] }, data)).toContain('two');
    expect(getOrderedProperties(schema, { hidden: () => ['two'] }, data)).toContain('two');
  });

  it('includes hidden fields when all non-hidden fields are in the order', () => {
    const order = ['one', 'three', 'four', 'five', 'six', 'seven'];

    expect(getOrderedProperties(schema, { order, hidden: ['two'] }, data)).toContain('two');
    expect(getOrderedProperties(schema, { order, hidden: () => ['two'] }, data)).toContain('two');
  });

  it('includes hidden fields when all non-hidden fields are in the order', () => {
    const order = ['one', 'three', ['four', 'five'], 'six', 'seven'];
    const expectedResult = ['one', 'three', ['four', 'five'], 'six', 'seven', 'two'];

    // @ts-expect-error
    expect(getOrderedProperties(schema, { order, hidden: ['two'] }, data)).toEqual(expectedResult);
    // @ts-expect-error
    expect(getOrderedProperties(schema, { order, hidden: () => ['two'] }, data)).toEqual(expectedResult);
  });

  it('sorts according to order option', () => {
    const expectedResult = ['three', 'one', 'four', ['five', 'six'], 'seven', 'two'];
    const order = ['three', '*', ['five', 'six'], ['seven'], 'two'];

    // @ts-expect-error
    expect(getOrderedProperties(schema, { order }, data)).toEqual(expectedResult);
    // @ts-expect-error
    expect(getOrderedProperties(schema, { order: () => order }, data)).toEqual(expectedResult);
  });

  it("excludes fields that don't exist in the schema", () => {
    expect(getOrderedProperties(schema, { order: ['three', '*', 'two', 'eight'] }, data)).not.toContain('eight');
    expect(getOrderedProperties(schema, { order: () => ['three', '*', 'two', 'eight'] }, data)).not.toContain('eight');
  });

  it('does not throw an exception for no wildcard if all fields are ordered', () => {
    const order = ['three', 'one', 'four', ['five', 'six'], ['seven'], 'two'];
    // @ts-expect-error
    expect(() => getOrderedProperties(schema, { order }, data)).not.toThrow();
  });

  it('does not include wildcard in ordered fields if all fields are present', () => {
    const order = ['three', 'one', 'four', '*', ['five', 'six'], ['seven'], 'two'];
    // @ts-expect-error
    expect(getOrderedProperties(schema, { order }, data)).not.toContain('*');
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
