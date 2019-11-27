// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgText from '../../../src/lgUtils/parsers/parseLgText';

describe('parseLgText', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgText(null as any)).toEqual(null);
    expect(parseLgText({} as any)).toEqual(null);
    expect(parseLgText('')).toEqual(null);
    expect(parseLgText('hello')).toEqual(null);
  });

  it('should return LgTemplateRef when inputs are valid', () => {
    expect(parseLgText('-')).toEqual('');
    expect(parseLgText('-hi')).toEqual('hi');
    expect(parseLgText('-[greeting()]')).toEqual('[greeting()]');
    expect(parseLgText('-[bfdactivity-1234]')).toEqual('[bfdactivity-1234]');
    expect(parseLgText('-Hi, [greeting()]')).toEqual('Hi, [greeting()]');

    expect(parseLgText('- ')).toEqual('');
    expect(parseLgText('- hi')).toEqual('hi');
    expect(parseLgText('- [greeting()]')).toEqual('[greeting()]');
    expect(parseLgText('- [bfdactivity-1234]')).toEqual('[bfdactivity-1234]');
    expect(parseLgText('- Hi, [greeting()]')).toEqual('Hi, [greeting()]');
  });
});
