// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parseLgTemplateRef, LgTemplateRef } from '../../../src';

describe('parseLgTemplateRef', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgTemplateRef('')).toEqual(null);
    expect(parseLgTemplateRef('xxx')).toEqual(null);
  });

  it('should return LgTemplateRef when inputs are valid', () => {
    const result = parseLgTemplateRef('[bfdactivity-123456]');
    expect(result).toBeInstanceOf(LgTemplateRef);
    expect((result as LgTemplateRef).name).toEqual('bfdactivity-123456');
    expect((result as LgTemplateRef).parameters).toEqual(undefined);
  });
});
