// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { createPath } from '../../src/validations/expressionValidation/utils';

describe('create right diagnostic path', () => {
  it('should check if the diagnostics have errors', () => {
    expect(createPath('Main.triggers[7].actions[0].cases[1].actions[0].condition', 'type')).toBe(
      'Main.triggers[7].actions[0].cases[1].actions[0]#type#condition'
    );
    expect(createPath('Main.triggers[7].actions[0].condition', 'type')).toBe(
      'Main.triggers[7].actions[0]#type#condition'
    );
    expect(createPath('Main.triggers[7].condition', 'type')).toBe('Main.triggers[7]#type#condition');
    expect(createPath('Main.triggers[7].actions[0].elseActions[0].condition', 'type')).toBe(
      'Main.triggers[7].actions[0].elseActions[0]#type#condition'
    );
    expect(createPath('Main.triggers[7].actions[0]', 'type')).toBe('Main.triggers[7].actions[0]#type');
  });
});
