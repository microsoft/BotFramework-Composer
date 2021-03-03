// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { transformSwitchCondition } from '../../../src/adaptive-flow-renderer/transformers/transformSwitchCondition';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

test('should return NULL when input is invalid', () => {
  expect(transformSwitchCondition(null, '')).toBeNull();
  expect(transformSwitchCondition({}, '')).toBeTruthy();
});

test('should return correct schema when input empty cases', () => {
  const json = {
    $kind: AdaptiveKinds.SwitchCondition,
    condition: 'a==b',
    cases: [],
    default: [],
  };

  const result: any = transformSwitchCondition(json, 'actions[0]');

  expect(result).toBeTruthy();

  expect(result.condition).toBeTruthy();
  expect(result.condition.id).toEqual('actions[0]');

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual('actions[0]');

  expect(result.branches).toBeTruthy();
  expect(result.branches.length).toEqual(1);
  expect(result.branches[0].id).toEqual('actions[0].default');
});

test('should return correct schema when input empty cases', () => {
  const json = {
    $kind: AdaptiveKinds.SwitchCondition,
    condition: 'a==b',
    cases: [
      {
        value: '1',
        actions: [{ $kind: AdaptiveKinds.SendActivity }],
      },
    ],
    default: [{ $kind: AdaptiveKinds.SendActivity }],
  };

  const result: any = transformSwitchCondition(json, 'actions[0]');

  expect(result).toBeTruthy();

  expect(result.condition).toBeTruthy();
  expect(result.condition.id).toEqual('actions[0]');

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual('actions[0]');

  expect(result.branches).toBeTruthy();
  expect(result.branches.length).toEqual(2);

  expect(result.branches[0].id).toEqual('actions[0].default');
  expect(result.branches[0].json.children.length).toEqual(1);

  expect(result.branches[1].id).toEqual('actions[0].cases[0].actions');
  expect(result.branches[1].json.children.length).toEqual(1);
  expect(result.branches[1].json.label).toEqual(json.cases[0].value);
});
