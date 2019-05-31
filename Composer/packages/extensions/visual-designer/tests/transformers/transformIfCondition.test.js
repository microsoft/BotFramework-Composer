import { transformIfCondtion } from '../../src/transformers/transformIfCondition';
import { ObiTypes } from '../../src/shared/ObiTypes';

test('should return {} when input is not IfCondition', () => {
  const json = { $type: '' };
  const result = transformIfCondtion(json, '');
  expect(Object.values(result).length === 0).toBeTruthy();
});

test('should return correct schema when input choice and empty branches', () => {
  const json = { $type: ObiTypes.IfCondition, conditon: 'a==b', steps: [], elseSteps: [] };
  const result = transformIfCondtion(json);
  expect(result.choice).toBeTruthy();
  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json).toEqual({
    $type: ObiTypes.StepGroup,
    children: [],
  });
  expect(result.elseGroup.json).toBeTruthy();
  expect(result.elseGroup.json).toEqual({
    $type: ObiTypes.StepGroup,
    children: [],
  });
});

test('should return correct schema when input choice only json', () => {
  const json = { $type: ObiTypes.IfCondition, conditon: 'a==b' };
  const result = transformIfCondtion(json);
  expect(result.choice).toBeTruthy();
  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json).toEqual({
    $type: ObiTypes.StepGroup,
    children: [],
  });
  expect(result.elseGroup.json).toBeTruthy();
  expect(result.elseGroup.json).toEqual({
    $type: ObiTypes.StepGroup,
    children: [],
  });
});

test('should return correct schema when input complete json', () => {
  const json = {
    $type: ObiTypes.IfCondition,
    conditon: 'a==b',
    steps: [{ $type: 'any' }],
    elseSteps: [{ $type: 'any' }, { $type: 'any' }],
  };
  const result = transformIfCondtion(json);

  expect(result.choice).toBeTruthy();

  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json.$type).toEqual(ObiTypes.StepGroup);
  expect(result.ifGroup.json.children.length).toEqual(1);

  expect(result.elseGroup).toBeTruthy();
  expect(result.elseGroup.json.$type).toEqual(ObiTypes.StepGroup);
  expect(result.elseGroup.json.children.length).toEqual(2);
});

test('should jsonpath be passed down to children', () => {
  const json = {
    $type: ObiTypes.IfCondition,
    conditon: 'a==b',
    steps: [{ $type: 'any' }],
    elseSteps: [{ $type: 'any' }, { $type: 'any' }],
  };
  const currentPath = 'current';
  const result = transformIfCondtion(json, currentPath);

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual(currentPath);

  expect(result.ifGroup).toBeTruthy();
  expect(result.ifGroup.json.children[0].id.indexOf(currentPath)).toEqual(0);

  expect(result.elseGroup).toBeTruthy();
  expect(result.ifGroup.json.children[0].id.indexOf(currentPath)).toEqual(0);
});
