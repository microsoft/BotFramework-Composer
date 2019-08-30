import { transformForeach } from '../../src/transformers/transformForeach';
import { ObiTypes } from '../../src/constants/ObiTypes';

test('should return NULL when input is invalid', () => {
  expect(transformForeach(null, '')).toBeNull();
  expect(transformForeach({}, '')).toBeNull();
  expect(transformForeach({ $type: 'wrong' }, '')).toBeNull();
});

test('should return correct schema when input a Foreach schema', () => {
  const json = {
    $type: 'Microsoft.Foreach',
    listProperty: 'users.todo',
    steps: [],
  };

  const result = transformForeach(json, 'steps[0]');
  if (!result) throw new Error('transform Foreach got a wrong result');

  expect(result).toBeDefined();

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;

  expect(foreachDetail).toBeDefined();
  expect(foreachDetail.id).toEqual('steps[0]');
  expect(foreachDetail.json.$type).toEqual(ObiTypes.ForeachDetail);
  expect(foreachDetail.json.listProperty).toEqual(json.listProperty);

  expect(stepGroup).toBeDefined();
  expect(stepGroup.id).toEqual('steps[0].steps');
  expect(stepGroup.json.$type).toEqual(ObiTypes.StepGroup);
  expect(stepGroup.json.children.length).toEqual(0);

  expect(loopBegin).toBeDefined();
  expect(loopBegin.id).toEqual('steps[0]');
  expect(loopBegin.json.$type).toEqual(ObiTypes.LoopIndicator);

  expect(loopEnd).toBeDefined();
  expect(loopEnd.id).toEqual('steps[0]');
  expect(loopEnd.json.$type).toEqual(ObiTypes.LoopIndicator);
});

test('should return correct schema when input a ForeachPage schema', () => {
  const json = {
    $type: 'Microsoft.ForeachPage',
    listProperty: 'users.todo',
    pageSize: 2,
    steps: [],
  };

  const result = transformForeach(json, 'steps[0]');
  if (!result) throw new Error('transform Foreach got a wrong result');

  expect(result).toBeDefined();

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;

  expect(foreachDetail).toBeDefined();
  expect(foreachDetail.id).toEqual('steps[0]');
  expect(foreachDetail.json.$type).toEqual(ObiTypes.ForeachPageDetail);
  expect(foreachDetail.json.listProperty).toEqual(json.listProperty);

  expect(stepGroup).toBeDefined();
  expect(stepGroup.id).toEqual('steps[0].steps');
  expect(stepGroup.json.$type).toEqual(ObiTypes.StepGroup);
  expect(stepGroup.json.children.length).toEqual(0);

  expect(loopBegin).toBeDefined();
  expect(loopBegin.id).toEqual('steps[0]');
  expect(loopBegin.json.$type).toEqual(ObiTypes.LoopIndicator);

  expect(loopEnd).toBeDefined();
  expect(loopEnd.id).toEqual('steps[0]');
  expect(loopEnd.json.$type).toEqual(ObiTypes.LoopIndicator);
});
