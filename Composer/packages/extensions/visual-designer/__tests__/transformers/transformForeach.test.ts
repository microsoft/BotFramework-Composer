// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { transformForeach } from '../../src/transformers/transformForeach';
import { ObiTypes } from '../../src/constants/ObiTypes';

test('should return NULL when input is invalid', () => {
  expect(transformForeach(null, '')).toBeNull();
  expect(transformForeach({}, '')).toBeNull();
  expect(transformForeach({ $kind: 'wrong' }, '')).toBeNull();
});

test('should return correct schema when input a Foreach schema', () => {
  const json = {
    $kind: 'Microsoft.Foreach',
    listProperty: 'users.todo',
    steps: [],
  };

  const result = transformForeach(json, 'actions[0]');
  if (!result) throw new Error('transform Foreach got a wrong result');

  expect(result).toBeDefined();

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;

  expect(foreachDetail).toBeDefined();
  expect(foreachDetail.id).toEqual('actions[0]');
  expect(foreachDetail.json.$kind).toEqual(ObiTypes.ForeachDetail);
  expect(foreachDetail.json.listProperty).toEqual(json.listProperty);

  expect(stepGroup).toBeDefined();
  expect(stepGroup.id).toEqual('actions[0].actions');
  expect(stepGroup.json.$kind).toEqual(ObiTypes.StepGroup);
  expect(stepGroup.json.children.length).toEqual(0);

  expect(loopBegin).toBeDefined();
  expect(loopBegin.id).toEqual('actions[0]');
  expect(loopBegin.json.$kind).toEqual(ObiTypes.LoopIndicator);

  expect(loopEnd).toBeDefined();
  expect(loopEnd.id).toEqual('actions[0]');
  expect(loopEnd.json.$kind).toEqual(ObiTypes.LoopIndicator);
});

test('should return correct schema when input a ForeachPage schema', () => {
  const json = {
    $kind: 'Microsoft.ForeachPage',
    listProperty: 'users.todo',
    pageSize: 2,
    actions: [],
  };

  const result = transformForeach(json, 'actions[0]');
  if (!result) throw new Error('transform Foreach got a wrong result');

  expect(result).toBeDefined();

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;

  expect(foreachDetail).toBeDefined();
  expect(foreachDetail.id).toEqual('actions[0]');
  expect(foreachDetail.json.$kind).toEqual(ObiTypes.ForeachPageDetail);
  expect(foreachDetail.json.listProperty).toEqual(json.listProperty);

  expect(stepGroup).toBeDefined();
  expect(stepGroup.id).toEqual('actions[0].actions');
  expect(stepGroup.json.$kind).toEqual(ObiTypes.StepGroup);
  expect(stepGroup.json.children.length).toEqual(0);

  expect(loopBegin).toBeDefined();
  expect(loopBegin.id).toEqual('actions[0]');
  expect(loopBegin.json.$kind).toEqual(ObiTypes.LoopIndicator);

  expect(loopEnd).toBeDefined();
  expect(loopEnd.id).toEqual('actions[0]');
  expect(loopEnd.json.$kind).toEqual(ObiTypes.LoopIndicator);
});
