// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { extractLgTemplateNames } from '../../src';

describe('extractLgTemplateRefs', () => {
  it('can extract lg refs from input string', () => {
    expect(extractLgTemplateNames('Hi')).toEqual([]);
    expect(extractLgTemplateNames(`-[Greeting], I'm a fancy bot, [Bye]`)).toEqual(['Greeting', 'Bye']);
  });
});
