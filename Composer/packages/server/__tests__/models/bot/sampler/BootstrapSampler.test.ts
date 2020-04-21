// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ComposerBootstrapSampler } from './../../../../src/models/bot/sampler/BootstrapSampler';

describe('BootstrapSampler', () => {
  it('balence the utterances ratio in intents after bootstrap sampling', async () => {
    const utterances = [
      { intent: '0', text: '1', entities: [] },
      { intent: '0', text: '2', entities: [] },
      { intent: '1', text: '3', entities: [] },
      { intent: '1', text: '4', entities: [] },
      { intent: '1', text: '5', entities: [] },
      { intent: '1', text: '6', entities: [] },
      { intent: '1', text: '7', entities: [] },
    ];
    const sampler = new ComposerBootstrapSampler(utterances, 2);
    const result = sampler.getSampledUtterances();
    const intent1 = result.filter(e => e.intent === '1').length;
    expect(2 / intent1).toBeCloseTo(0.5, 2);
    const sampler1 = new ComposerBootstrapSampler(utterances, 5);
    const result1 = sampler1.getSampledUtterances();
    const intent11 = result1.filter(e => e.intent === '1').length;
    expect(intent11).toBeCloseTo(5);
  });
});
