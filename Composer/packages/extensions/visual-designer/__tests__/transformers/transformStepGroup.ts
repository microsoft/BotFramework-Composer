import { transformStepGroup } from '../../src/transformers/transformStepGroup';
import { ObiTypes } from '../../src/shared/ObiTypes';

test('should return safely when input null value', () => {
  const result = transformStepGroup(null, '');
  expect(result).toEqual([]);
});

test('should parse child step correctly with parentPath', () => {
  const json = {
    $type: ObiTypes.StepGroup,
    children: [{ $type: 'any' }, { $type: 'any' }],
  };
  const result = transformStepGroup(json, 'steps');
  expect(result).toBeTruthy();
  expect(result.length).toEqual(json.children.length);

  for (let i = 0; i < json.children.length; i++) {
    expect(result[i].id).toEqual(`steps[${i}]`);
  }
});
