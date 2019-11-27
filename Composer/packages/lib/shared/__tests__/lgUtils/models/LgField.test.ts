// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgField, LgTemplateRef } from '../../../src';

describe('LgField#', () => {
  describe('parse() should work', () => {
    it('when inputs a lg content string', () => {
      const result = LgField.parse('- hello');

      expect((result as LgField).isLgText()).toBeTruthy();
      expect((result as LgField).content).toEqual('hello');
    });

    it('when inputs a lg ref string', () => {
      const inputTemplateRef = new LgTemplateRef('greeting');
      const result = LgField.parse(inputTemplateRef.toString());

      expect((result as LgField).isTemplateRef()).toBeTruthy();
      expect((result as LgField).content).toEqual(inputTemplateRef);
    });

    it('when input is plain string', () => {
      const result = LgField.parse('hi');

      expect((result as LgField).isLgText()).toBeTruthy();
      expect((result as LgField).content).toEqual('hi');
    });
  });

  describe('from() should work', () => {
    it('when inputs a template ref object', () => {
      const inputRef = new LgTemplateRef('greeting');
      const result = LgField.from(inputRef);

      expect((result as LgField).isTemplateRef()).toBeTruthy();
      expect((result as LgField).content).toEqual(inputRef);
    });
  });

  it('toString() should be symmetric', () => {
    expect(LgField.parse('').toString()).toEqual('- ');
    expect(LgField.parse('-').toString()).toEqual('- ');

    expect(LgField.parse('- hi').toString()).toEqual('- hi');
    expect(LgField.parse('-hi').toString()).toEqual('- hi');

    expect(LgField.parse('[greeting]').toString()).toEqual('- [greeting]');
    expect(LgField.parse('[bfdactivity-123456]').toString()).toEqual('- [bfdactivity-123456]');

    expect(LgField.parse('- [greeting]').toString()).toEqual('- [greeting]');
    expect(LgField.parse('-[bfdactivity-123456]').toString()).toEqual('- [bfdactivity-123456]');
  });
});
