import { transformObiRules } from '../../src/transformers/transformObiRules';

test('should return safely when input null value', () => {
  const result = transformObiRules(null);
  expect(result).toEqual({});
});

test('should parse single rule correctly with empty parentPath', () => {
  const json = {
    $type: 'Microsoft.IntentRule',
    steps: [{ $type: 'any' }],
  };
  const result = transformObiRules(json, '');
  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('steps');
  expect(result.stepGroup.json.children.length === json.steps.length).toBeTruthy();
});

test('should parse single rule correctly with real parentPath', () => {
  const json = {
    $type: 'Microsoft.IntentRule',
    steps: [{ $type: 'any' }],
  };
  const result = transformObiRules(json, 'rules[0]');
  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('rules[0].steps');
  expect(result.stepGroup.json.children.length === json.steps.length).toBeTruthy();
});
