// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { checkProperty, getProperties } from '../../src/dialogUtils/extractMemoryPaths';

const data = [
  {
    $type: 'Microsoft.NumberInput',
    property: 'user.a',
  },
  {
    $type: 'Microsoft.SetProperty',
    property: 'user.b',
  },
  {
    $type: 'Microsoft.OAuthInput',
    tokenProperty: 'user.c',
  },
  {
    $type: 'Microsoft.HttpRequest',
    resultProperty: 'user.d',
  },
  {
    $type: 'Microsoft.SetProperties',
    assignments: [{ property: 'user.e' }, { property: 'user.f' }],
  },
];

describe('extract the properties', () => {
  it('should check the property', () => {
    expect(checkProperty('user.age')).toBe(true);
    expect(checkProperty('user.value.age')).toBe(true);
    expect(checkProperty('user. age')).toBe(false);
    expect(checkProperty('conversation.id')).toBe(true);
    expect(checkProperty('dialog.id')).toBe(true);
    expect(checkProperty('this.value')).toBe(true);
    expect(checkProperty('user.a ge')).toBe(false);
    expect(checkProperty('user')).toBe(false);
    expect(checkProperty('user.')).toBe(false);
    expect(checkProperty('user.age ')).toBe(true);
    expect(checkProperty(' user.age ')).toBe(true);
    expect(checkProperty('a.b')).toBe(false);
  });
  it('should extract the properties', () => {
    expect(getProperties(data[0])[0]).toBe('user.a');
    expect(getProperties(data[1])[0]).toBe('user.b');
    expect(getProperties(data[2])[0]).toBe('user.c');
    expect(getProperties(data[3])[0]).toBe('user.d');
    expect(getProperties(data[4]).indexOf('user.e')).toBeGreaterThan(-1);
  });
});
