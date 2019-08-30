import { transformStepGroup } from '../../src/transformers/transformStepGroup';
import { ObiTypes } from '../../src/constants/ObiTypes';

test('should return safely when input null value', () => {
  const result = transformStepGroup(null, '');
  expect(result).toEqual([]);
});

test('should transform string as BeginDialog', () => {
  const result = transformStepGroup(
    {
      $type: ObiTypes.StepGroup,
      children: ['CalleeDialog'],
    },
    ''
  );
  expect(result[0].json).toEqual({
    $type: ObiTypes.BeginDialog,
    dialog: 'CalleeDialog',
  });
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
