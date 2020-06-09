// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { transformObiRules } from '../../../src/adaptive-flow-renderer/transformers/transformObiRules';

test('should return safely when input null value', () => {
  const result = transformObiRules(null);
  expect(result).toBeNull();
});

test('should parse single rule correctly with empty parentPath', () => {
  const json = {
    $kind: 'Microsoft.IntentRule',
    actions: [{ $kind: 'any' }],
  };
  const result = transformObiRules(json, '');
  if (!result) throw new Error('transformObiRules got a wrong result');

  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('actions');
  expect(result.stepGroup.json.children.length === json.actions.length).toBeTruthy();
});

test('should parse single rule correctly with real parentPath', () => {
  const json = {
    $kind: 'Microsoft.IntentRule',
    actions: [{ $kind: 'any' }],
  };
  const result = transformObiRules(json, 'events[0]');
  if (!result) throw new Error('transformObiRules got a wrong result');

  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('events[0].actions');
  expect(result.stepGroup.json.children.length === json.actions.length).toBeTruthy();
});
