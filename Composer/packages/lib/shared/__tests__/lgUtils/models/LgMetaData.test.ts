// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgMetaData } from '../../../src';

describe('LgMetaData', () => {
  it('can construct an instance via constructor', () => {
    const instance = new LgMetaData('activity', '123456');

    expect(instance.type).toEqual('activity');
    expect(instance.designerId).toEqual('123456');
    expect(instance.toString).toBeDefined();
  });

  it('can generate correct output strings', () => {
    const instance = new LgMetaData('activity', '123456');

    expect(instance.toString()).toEqual('bfdactivity_123456');
  });

  it('can construct instance via `parse()` method', () => {
    expect(LgMetaData.parse('bfdactivity_123456')).toBeInstanceOf(LgMetaData);
  });
});
