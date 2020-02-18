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
  it('excludes fields according to ui:hidden', () => {
    const expectedResult = ['one', 'three', 'four'];

    expect(getOrderedProperties(schema, { 'ui:hidden': ['two'], 'ui:order': ['two', '*'] }, data)).toEqual(
      expectedResult
    );

    expect(getOrderedProperties(schema, { 'ui:hidden': () => ['two'], 'ui:order': ['two', '*'] }, data)).toEqual(
      expectedResult
    );
  });

  it('sorts according to ui:order', () => {
    const expectedResult = ['three', 'one', 'four', 'two'];

    expect(getOrderedProperties(schema, { 'ui:order': ['three', '*', 'two'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { 'ui:order': () => ['three', '*', 'two'] }, data)).toEqual(expectedResult);
  });

  it("excludes fields that don't exist in the schema", () => {
    const expectedResult = ['three', 'one', 'four', 'two'];

    expect(getOrderedProperties(schema, { 'ui:order': ['three', '*', 'two', 'five'] }, data)).toEqual(expectedResult);

    expect(getOrderedProperties(schema, { 'ui:order': () => ['three', '*', 'two', 'five'] }, data)).toEqual(
      expectedResult
    );
  });

  it('throws an exception if there is no wildcard in ui:order', () => {
    expect(() => getOrderedProperties(schema, { 'ui:order': ['three', 'two'] }, data)).toThrow('no wildcard');
  });

  it('throws an exception if there are multiple wildcards in ui:order', () => {
    expect(() => getOrderedProperties(schema, { 'ui:order': ['three', '*', 'two', '*'] }, data)).toThrow(
      'multiple wildcards'
    );
  });
});
