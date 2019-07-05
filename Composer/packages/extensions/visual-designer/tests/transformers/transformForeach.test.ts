import { transformForeach } from '../../src/transformers/transformForeach';
import { ObiTypes } from '../../src/shared/ObiTypes';

test('should return {} when input is invalid', () => {
  expect(transformForeach(null, '')).toEqual({});
  expect(transformForeach({}, '')).toEqual({});
  expect(transformForeach({ $type: 'wrong' }, '')).toEqual({});
});

test('should return correct schema when input a Foreach schema', () => {
  const json = {
    $type: 'Microsoft.Foreach',
    listProperty: 'users.todo',
    steps: [],
  };

  const result = transformForeach(json, 'steps[0]');

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
