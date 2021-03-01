// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { transformIfCondtion } from '../../../src/adaptive-flow-renderer/transformers/transformIfCondition';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

test('should defense null input', () => {
  expect(transformIfCondtion(null, '')).toBeFalsy();
  expect(transformIfCondtion({}, '')).toBeTruthy();
});

test('should return correct schema when input choice and empty branches', () => {
  const json = { $kind: AdaptiveKinds.IfCondition, conditon: 'a==b', actions: [], elseActions: [] };
  const result = transformIfCondtion(json, '');
  if (!result) throw new Error('IfCondition got a wrong result');

  expect(result.choice).toBeTruthy();
  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json).toEqual({
    $kind: AdaptiveKinds.StepGroup,
    children: [],
  });
  expect(result.elseGroup.json).toBeTruthy();
  expect(result.elseGroup.json).toEqual({
    $kind: AdaptiveKinds.StepGroup,
    children: [],
  });
});

test('should return correct schema when input choice only json', () => {
  const json = { $kind: AdaptiveKinds.IfCondition, conditon: 'a==b' };
  const result = transformIfCondtion(json, '');
  if (!result) throw new Error('IfCondition got a wrong result');

  expect(result.choice).toBeTruthy();
  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json).toEqual({
    $kind: AdaptiveKinds.StepGroup,
    children: [],
  });
  expect(result.elseGroup.json).toBeTruthy();
  expect(result.elseGroup.json).toEqual({
    $kind: AdaptiveKinds.StepGroup,
    children: [],
  });
});

test('should return correct schema when input complete json', () => {
  const json = {
    $kind: AdaptiveKinds.IfCondition,
    conditon: 'a==b',
    actions: [{ $kind: 'any' }],
    elseActions: [{ $kind: 'any' }, { $kind: 'any' }],
  };
  const result = transformIfCondtion(json, '');
  if (!result) throw new Error('IfCondition got a wrong result');

  expect(result.choice).toBeTruthy();

  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json.$kind).toEqual(AdaptiveKinds.StepGroup);
  expect(result.ifGroup.json.children.length).toEqual(1);

  expect(result.elseGroup).toBeTruthy();
  expect(result.elseGroup.json.$kind).toEqual(AdaptiveKinds.StepGroup);
  expect(result.elseGroup.json.children.length).toEqual(2);
});

test('should jsonpath be passed down to children', () => {
  const json = {
    $kind: AdaptiveKinds.IfCondition,
    conditon: 'a==b',
    actions: [{ $kind: 'any' }],
    elseActions: [{ $kind: 'any' }, { $kind: 'any' }],
  };
  const currentPath = 'current';
  const result = transformIfCondtion(json, currentPath);
  if (!result) throw new Error('IfCondition got a wrong result');

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual(currentPath);

  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.id).toEqual(`${currentPath}.actions`);

  expect(result.elseGroup).toBeTruthy();
  expect(result.elseGroup.id).toEqual(`${currentPath}.elseActions`);
});
