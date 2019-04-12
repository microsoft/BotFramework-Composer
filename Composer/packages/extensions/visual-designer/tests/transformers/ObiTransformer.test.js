import { obiTransformer } from '../../src/transformers/ObiTransformer';
import { PAYLOAD_KEY } from '../../src/utils/constant';

import * as todoBotSchema from './todoBot.json';
import * as todoBotWithStepSchema from './todoBotWithStep';

test('transforms todoBot-with-step.dialog to directed graph', () => {
  const schema = todoBotWithStepSchema;

  const nodes = obiTransformer.toGraphSchema(schema);
  expect(nodes.length).toEqual(10);

  nodes.forEach(node => {
    const nodeKeys = Object.keys(node);
    expect(nodeKeys).toEqual(expect.arrayContaining(['id', 'type', 'neighborIds', PAYLOAD_KEY]));
  });
});

test('transforms todoBot.dialog to root dialog', () => {
  const schema = todoBotSchema;

  const nodes = obiTransformer.toGraphSchema(schema);
  expect(nodes.length).toEqual(3);

  nodes.forEach(node => {
    const nodeKeys = Object.keys(node);
    expect(nodeKeys).toEqual(expect.arrayContaining(['id', 'type', 'neighborIds', PAYLOAD_KEY]));
  });
});

test('transforms IntentRule to steps', () => {
  const schema = todoBotSchema.rules[1];

  const nodes = obiTransformer.toGraphSchema(schema);
  expect(nodes.length).toEqual(1);

  nodes.forEach(node => {
    const nodeKeys = Object.keys(node);
    expect(nodeKeys).toEqual(expect.arrayContaining(['id', 'type', 'neighborIds', PAYLOAD_KEY]));
  });
});
