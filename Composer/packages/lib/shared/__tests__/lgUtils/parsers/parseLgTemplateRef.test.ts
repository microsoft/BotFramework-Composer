// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRef } from '../../../src';
import parseLgTemplateRef, { extractLgTemplateRefs } from '../../../src/lgUtils/parsers/parseLgTemplateRef';

describe('parseLgTemplateRef', () => {
  it('should return null when inputs are invalid', () => {
    expect(parseLgTemplateRef('')).toEqual(null);
    expect(parseLgTemplateRef('xxx')).toEqual(null);
    expect(parseLgTemplateRef('${0}')).toEqual(null);
    expect(parseLgTemplateRef('hi, ${greeting()}. ${greeting()}')).toEqual(null);
  });

  it('should return LgTemplateRef when inputs are valid', () => {
    const a = parseLgTemplateRef('${SendActivity_1Xkg4a()}');
    expect(a).toEqual(new LgTemplateRef('SendActivity_1Xkg4a'));

    const b = parseLgTemplateRef('${greeting(1,2)}');
    expect(b).toEqual(new LgTemplateRef('greeting', ['1', '2']));
  });
});

describe('extractLgTemplateRefs', () => {
  it('can extract lg refs from input string', () => {
    expect(extractLgTemplateRefs('Hi')).toEqual([]);
    expect(extractLgTemplateRefs('${SendActivity_1Xkg4a()}')).toEqual([new LgTemplateRef('SendActivity_1Xkg4a')]);
    expect(extractLgTemplateRefs(`-\${Greeting()}, I'm a fancy bot, \${Bye()}`)).toEqual([
      new LgTemplateRef('Greeting'),
      new LgTemplateRef('Bye'),
    ]);
  });
});
