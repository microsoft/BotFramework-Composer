// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parseLgTemplateRef, LgTemplateRef } from '../../../src';

describe('parseLgTemplateRef', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgTemplateRef('')).toEqual(null);
    expect(parseLgTemplateRef('xxx')).toEqual(null);
    expect(parseLgTemplateRef('[0]')).toEqual(null);
  });

  it('should return LgTemplateRef when inputs are valid', () => {
    const a = parseLgTemplateRef('[bfdactivity-123456]');
    expect(a).toBeInstanceOf(LgTemplateRef);
    expect((a as LgTemplateRef).name).toEqual('bfdactivity-123456');
    expect((a as LgTemplateRef).parameters).toEqual(undefined);

    const b = parseLgTemplateRef('[greeting(1,2)]');
    expect(b).toBeInstanceOf(LgTemplateRef);
    expect((b as LgTemplateRef).name).toEqual('greeting');
    expect((b as LgTemplateRef).parameters).toEqual(['1', '2']);
  });
});
