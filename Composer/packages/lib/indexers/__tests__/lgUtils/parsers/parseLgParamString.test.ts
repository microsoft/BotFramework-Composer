// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgParamString from '../../../src/lgUtils/parsers/parseLgParamString';

describe('parseLgParamString', () => {
  it('should return undefined when no params detected', () => {
    expect(parseLgParamString('')).toBeUndefined();
    expect(parseLgParamString('xxx')).toBeUndefined();
  });

  it('should return params array when input valid strings', () => {
    expect(parseLgParamString('()')).toEqual([]);
    expect(parseLgParamString('(a,b)')).toEqual(['a', 'b']);
  });
});
