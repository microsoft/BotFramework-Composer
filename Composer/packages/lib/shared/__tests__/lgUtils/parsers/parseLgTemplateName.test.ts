// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgMetaData } from '../../../src';
import parseLgTemplateName from '../../../src/lgUtils/parsers/parseLgTemplateName';

describe('parseLgTemplateName', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgTemplateName('')).toEqual(null);
    expect(parseLgTemplateName('xxx')).toEqual(null);
  });

  it('should return LgMetaData when inputs are valid', () => {
    const result = parseLgTemplateName('bfdactivity_123456');
    expect(result).toBeInstanceOf(LgMetaData);
    expect((result as LgMetaData).designerId).toEqual('123456');
    expect((result as LgMetaData).type).toEqual('activity');
  });
});
