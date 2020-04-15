// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerReservoirSampler } from './../../../../src/models/bot/sampler/ReservoirSampler';

describe('BootstrapSampler', () => {
  it('down size the number of utterances reservoir sampling', async () => {
    const utterances = [
      { intent: '0', text: '1', entities: [] },
      { intent: '1', text: '2', entities: [] },
      { intent: '1', text: '3', entities: [] },
      { intent: '1', text: '4', entities: [] },
      { intent: '1', text: '5', entities: [] },
      { intent: '1', text: '6', entities: [] },
      { intent: '1', text: '7', entities: [] },
      { intent: '1', text: '8', entities: [] },
      { intent: '1', text: '9', entities: [] },
      { intent: '1', text: '10', entities: [] },
      { intent: '1', text: '11', entities: [] },
      { intent: '1', text: '12', entities: [] },
      { intent: '1', text: '13', entities: [] },
      { intent: '1', text: '14', entities: [] },
      { intent: '1', text: '15', entities: [] },
    ];
    const sampler = new ComposerReservoirSampler(utterances);
    sampler.sampleSize = 10;
    expect(sampler.getSampledUtterances().length).toBe(10);
    sampler.sampleSize = 11;
    expect(sampler.getSampledUtterances().length).toBe(11);
    sampler.sampleSize = 12;
    expect(sampler.getSampledUtterances().length).toBe(12);
    sampler.sampleSize = 16;
    expect(sampler.getSampledUtterances().length).toBe(15);
  });
});
