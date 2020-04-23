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
    const sampler = new ComposerReservoirSampler(utterances, 10);
    expect(sampler.getSampledUtterances().length).toBe(10);
    const sampler1 = new ComposerReservoirSampler(utterances, 11);
    expect(sampler1.getSampledUtterances().length).toBe(11);
    const sampler2 = new ComposerReservoirSampler(utterances, 12);
    expect(sampler2.getSampledUtterances().length).toBe(12);
    const sampler3 = new ComposerReservoirSampler(utterances, 18);
    expect(sampler3.getSampledUtterances().length).toBe(15);
  });
});
