// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRef } from '../../../src';

describe('LgTemplateRef', () => {
  it('can construct an instance via constructor', () => {
    const a = new LgTemplateRef('a', undefined);
    expect(a.name).toEqual('a');
    expect(a.parameters).toEqual(undefined);

    const b = new LgTemplateRef('b', []);
    expect(b.name).toEqual('b');
    expect(b.parameters).toEqual([]);

    const c = new LgTemplateRef('c', ['1', '2']);
    expect(c.name).toEqual('c');
    expect(c.parameters).toEqual(['1', '2']);
  });

  it('can output correct strings', () => {
    const a = new LgTemplateRef('a', undefined);
    expect(a.toString()).toEqual('[a]');
    expect(a.toLgText()).toEqual('- [a]');

    const b = new LgTemplateRef('b', []);
    expect(b.toString()).toEqual('[b()]');
    expect(b.toLgText()).toEqual('- [b()]');

    const c = new LgTemplateRef('c', ['1', '2']);
    expect(c.toString()).toEqual('[c(1,2)]');
    expect(c.toLgText()).toEqual('- [c(1,2)]');
  });

  it('can construct instance via `parse()`', () => {
    expect(LgTemplateRef.parse('[bfdactivity-123456]')).toBeInstanceOf(LgTemplateRef);
  });
});
