// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getValueType } from '../getValueType';

describe('getValueType', () => {
  it('returns `array` for array types', () => {
    expect(getValueType([])).toEqual('array');
  });

  it('returns `integer` for integers', () => {
    expect(getValueType(123)).toEqual('integer');
  });

  it('returns `number` for floats', () => {
    expect(getValueType(1.23)).toEqual('number');
  });

  it('returns js type for other types', () => {
    const tests = [
      {
        value: 'string',
        type: 'string',
      },
      {
        value: {},
        type: 'object',
      },
      {
        value: true,
        type: 'boolean',
      },
      {
        value: undefined,
        type: 'undefined',
      },
    ];

    tests.forEach((t) => {
      expect(getValueType(t.value)).toEqual(t.type);
    });
  });
});
