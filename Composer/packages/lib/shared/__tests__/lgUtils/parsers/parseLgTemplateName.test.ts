// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parseLgTemplateName, LgMetaData } from '../../../src';

describe('parseLgTemplateName', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgTemplateName('')).toEqual(null);
    expect(parseLgTemplateName('xxx')).toEqual(null);
  });

  it('should return LgMetaData when inputs are valid', () => {
    const result = parseLgTemplateName('bfdactivity-123456');
    expect(result).toBeInstanceOf(LgMetaData);
    expect((result as LgMetaData).designerId).toEqual('123456');
    expect((result as LgMetaData).type).toEqual('activity');
  });
});
