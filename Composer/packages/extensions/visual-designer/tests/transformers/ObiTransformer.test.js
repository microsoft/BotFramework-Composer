import { obiTransformer } from '../../src/transformers/ObiTransformer';
import { PAYLOAD_KEY } from '../../src/utils/constant';

import * as todoBotSchema from './todoBot.json';

test('transforms todoBot.dialog to directed graph', () => {
  const schema = todoBotSchema;

  const transformable = obiTransformer.checkTransformability(schema);
  expect(transformable).toBeTruthy();

  const nodes = obiTransformer.toGraphSchema(schema);
  expect(nodes.length).toEqual(6);

  nodes.forEach(node => {
    const nodeKeys = Object.keys(node);
    expect(nodeKeys).toEqual(expect.arrayContaining(['id', 'type', 'neighborIds', PAYLOAD_KEY]));
  });
});

test('transforms IntentRule to steps', () => {
  const schema = todoBotSchema.rules[1];

  const transformable = obiTransformer.checkTransformability(schema);
  expect(transformable).toBeTruthy();

  const nodes = obiTransformer.toGraphSchema(schema);
  expect(nodes.length).toEqual(1);

  nodes.forEach(node => {
    const nodeKeys = Object.keys(node);
    expect(nodeKeys).toEqual(expect.arrayContaining(['id', 'type', 'neighborIds', PAYLOAD_KEY]));
  });
});
