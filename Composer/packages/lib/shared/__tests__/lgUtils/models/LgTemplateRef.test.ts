// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRef } from '../../../src';

describe('LgTemplateRef#', () => {
  it('can construct an instance via constructor', () => {
    const a = new LgTemplateRef('a', undefined);
    expect(a.name).toEqual('a');
    expect(a.parameters).toEqual([]);

    const b = new LgTemplateRef('b', []);
    expect(b.name).toEqual('b');
    expect(b.parameters).toEqual([]);

    const c = new LgTemplateRef('c', ['1', '2']);
    expect(c.name).toEqual('c');
    expect(c.parameters).toEqual(['1', '2']);
  });

  it('can output correct strings', () => {
    const a = new LgTemplateRef('a', undefined);
    expect(a.toString()).toEqual('${a()}');

    const b = new LgTemplateRef('b', []);
    expect(b.toString()).toEqual('${b()}');

    const c = new LgTemplateRef('c', ['1', '2']);
    expect(c.toString()).toEqual('${c(1,2)}');
  });

  describe('parse()', () => {
    it('should return null when inputs are invalid', () => {
      expect(LgTemplateRef.parse()).toEqual(null);
      expect(LgTemplateRef.parse('')).toEqual(null);
      expect(LgTemplateRef.parse('xxx')).toEqual(null);
      expect(LgTemplateRef.parse('${0}')).toEqual(null);
    });

    it('should return LgTemplateRef when inputs are valid', () => {
      const a = LgTemplateRef.parse('${SendActivity_1Xkg4a()}');
      expect(a).toEqual(new LgTemplateRef('SendActivity_1Xkg4a'));

      const a2 = LgTemplateRef.parse('${SendActivity_1Xkg4a()}');
      expect(a2).toEqual(new LgTemplateRef('SendActivity_1Xkg4a'));

      const b = LgTemplateRef.parse('${greeting(1,2)}');
      expect(b).toEqual(new LgTemplateRef('greeting', ['1', '2']));
    });
  });
});
