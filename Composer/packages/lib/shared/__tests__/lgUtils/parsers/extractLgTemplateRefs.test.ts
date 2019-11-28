// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRef } from '../../../src';
import extractLgTemplateRefs from '../../../src/lgUtils/parsers/extractLgTemplateRefs';

describe('extractLgTemplateRefs', () => {
  it('can extract lg refs from input string', () => {
    expect(extractLgTemplateRefs('Hi')).toEqual([]);
    expect(extractLgTemplateRefs('[bfdactivity-123456]')).toEqual([new LgTemplateRef('bfdactivity-123456')]);
    expect(extractLgTemplateRefs(`-[Greeting], I'm a fancy bot, [Bye]`)).toEqual([
      new LgTemplateRef('Greeting'),
      new LgTemplateRef('Bye'),
    ]);
  });
});
