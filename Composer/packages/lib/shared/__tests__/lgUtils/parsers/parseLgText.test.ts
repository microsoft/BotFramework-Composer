// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgText from '../../../src/lgUtils/parsers/parseLgText';
import { LgTemplateRef } from '../../../src';

describe('parseLgText', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgText('')).toEqual(null);
    expect(parseLgText('xxx')).toEqual(null);
    expect(parseLgText('[bfdactivity-1234]')).toEqual(null);
  });

  it('should return LgTemplateRef when inputs are valid', () => {
    const result = parseLgText('- [bfdactivity-123456]');
    expect(result).toBeInstanceOf(LgTemplateRef);
    expect((result as LgTemplateRef).name).toEqual('bfdactivity-123456');
    expect((result as LgTemplateRef).parameters).toEqual(undefined);
  });
});
