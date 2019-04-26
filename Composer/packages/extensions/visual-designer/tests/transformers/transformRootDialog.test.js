import { transformRootDialog } from '../../src/transformers/transformRootDialog.js';

import * as TodoBotMain from './todoBot.main.json';

test('should return safely when input null value', () => {
  const result = transformRootDialog(null);
  expect(result).toEqual({});
});

test('should parse recognizerGroup when input TodoBotMain', () => {
  const result = transformRootDialog(TodoBotMain);
  expect(Object.values(result).length > 0).toBeTruthy();
  expect(result.recognizerGroup).toBeTruthy();
});

test('should parse recognizerGroup and stepGroup when input TodoBotMain with steps', () => {
  const jsonWithSteps = {
    ...TodoBotMain,
    steps: [{ $type: 'any' }],
  };
  const result = transformRootDialog(jsonWithSteps);
  expect(result.recognizerGroup).toBeTruthy();
  expect(result.stepGroup).toBeTruthy();
  expect(result.stepGroup.json.children.length === jsonWithSteps.steps.length).toBeTruthy();
});

test('should parse ruleGroup and stepGroup when input TodoBotMain without recognizer', () => {
  const jsonWithoutRecognizer = {
    ...TodoBotMain,
    recognizer: null,
  };
  const result = transformRootDialog(jsonWithoutRecognizer);
  expect(result.recognizerGroup).toBeFalsy();
  expect(result.ruleGroup).toBeTruthy();
  expect(result.ruleGroup.json.children.length === jsonWithoutRecognizer.rules.length).toBeTruthy();
});
