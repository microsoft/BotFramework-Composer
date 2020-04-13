// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgMetaData } from '../../../src';

describe('LgMetaData', () => {
  it('can construct an instance via constructor', () => {
    const instance = new LgMetaData('SendActivity', '1Xkg4a');

    expect(instance.type).toEqual('SendActivity');
    expect(instance.designerId).toEqual('1Xkg4a');
    expect(instance.toString).toBeDefined();
  });

  it('can generate correct output strings', () => {
    const instance = new LgMetaData('SendActivity', '1Xkg4a');

    expect(instance.toString()).toEqual('SendActivity_1Xkg4a');
  });

  it('can construct instance via `parse()` method', () => {
    expect(LgMetaData.parse('SendActivity_1Xkg4a')).toBeInstanceOf(LgMetaData);
  });
});
