import { transformObiRules } from '../../src/transformers/transformObiRules';

test('should return safely when input null value', () => {
  const result = transformObiRules(null);
  expect(result).toBeNull();
});

test('should parse single rule correctly with empty parentPath', () => {
  const json = {
    $type: 'Microsoft.IntentRule',
    actions: [{ $type: 'any' }],
  };
  const result = transformObiRules(json, '');
  if (!result) throw new Error('transformObiRules got a wrong result');

  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('actions');
  expect(result.stepGroup.json.children.length === json.actions.length).toBeTruthy();
});

test('should parse single rule correctly with real parentPath', () => {
  const json = {
    $type: 'Microsoft.IntentRule',
    actions: [{ $type: 'any' }],
  };
  const result = transformObiRules(json, 'events[0]');
  if (!result) throw new Error('transformObiRules got a wrong result');

  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.id).toEqual('events[0].actions');
  expect(result.stepGroup.json.children.length === json.actions.length).toBeTruthy();
});
