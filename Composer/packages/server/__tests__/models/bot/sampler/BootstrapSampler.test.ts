// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ComposerBootstrapSampler } from './../../../../src/models/bot/sampler/BootstrapSampler';

describe('BootstrapSampler', () => {
  it('balence the utterances ratio in intents after bootstrap sampling', async () => {
    const utterances = [
      { intent: '0', text: '1', entities: [] },
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
    const sampler = new ComposerBootstrapSampler(utterances, 10);
    const result = sampler.getSampledUtterances();
    const intent1 = result.filter(e => e.intent === '1').length;
    expect((result.length - intent1) / intent1).toBeCloseTo(0.1, 2);
    const sampler1 = new ComposerBootstrapSampler(utterances, 5);
    const result1 = sampler1.getSampledUtterances();
    const intent11 = result1.filter(e => e.intent === '1').length;
    expect((result1.length - intent11) / intent11).toBeCloseTo(0.2, 2);
  });
});
