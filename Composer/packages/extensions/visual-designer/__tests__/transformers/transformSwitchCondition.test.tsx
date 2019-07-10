import { transformSwitchCondition } from '../../src/transformers/transformSwitchCondition';
import { ObiTypes } from '../../src/shared/ObiTypes';

test('should return {} when input is not SwitchCondition', () => {
  expect(transformSwitchCondition(null, '')).toEqual({});
  expect(transformSwitchCondition({}, '')).toEqual({});
  expect(transformSwitchCondition({ $type: 'wrong' }, '')).toEqual({});
});

test('should return correct schema when input empty cases', () => {
  const json = {
    $type: ObiTypes.SwitchCondition,
    condition: 'a==b',
    cases: [],
    default: [],
  };

  const result = transformSwitchCondition(json, 'steps[0]');

  expect(result).toBeTruthy();

  expect(result.condition).toBeTruthy();
  expect(result.condition.id).toEqual('steps[0]');

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual('steps[0]');

  expect(result.branches).toBeTruthy();
  expect(result.branches.length).toEqual(1);
  expect(result.branches[0].id).toEqual('steps[0].default');
});

test('should return correct schema when input empty cases', () => {
  const json = {
    $type: ObiTypes.SwitchCondition,
    condition: 'a==b',
    cases: [
      {
        value: '1',
        steps: [{ $type: ObiTypes.SendActivity }],
      },
    ],
    default: [{ $type: ObiTypes.SendActivity }],
  };

  const result = transformSwitchCondition(json, 'steps[0]');

  expect(result).toBeTruthy();

  expect(result.condition).toBeTruthy();
  expect(result.condition.id).toEqual('steps[0]');

  expect(result.choice).toBeTruthy();
  expect(result.choice.id).toEqual('steps[0]');

  expect(result.branches).toBeTruthy();
  expect(result.branches.length).toEqual(2);

  expect(result.branches[0].id).toEqual('steps[0].default');
  expect(result.branches[0].json.children.length).toEqual(1);
  expect(result.branches[0].json.children[0].id).toEqual('steps[0].default[0]');

  expect(result.branches[1].id).toEqual('steps[0].cases[0].steps');
  expect(result.branches[1].json.children.length).toEqual(1);
  expect(result.branches[1].json.children[0].id).toEqual('steps[0].cases[0].steps[0]');
  expect(result.branches[1].json.label).toEqual(json.cases[0].value);
});
