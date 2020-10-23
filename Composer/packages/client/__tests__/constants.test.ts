// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogNameRegex } from '../src/constants';

describe('check dialog name', () => {
  it('don not support special characters', () => {
    expect(dialogNameRegex.test('*a')).toBeFalsy();
    expect(dialogNameRegex.test('c*a')).toBeFalsy();
    expect(dialogNameRegex.test('c a')).toBeFalsy();
  });

  it('don not support number at the beginning.', () => {
    expect(dialogNameRegex.test('1a')).toBeFalsy();
    expect(dialogNameRegex.test('a1')).toBeTruthy();
  });
});
