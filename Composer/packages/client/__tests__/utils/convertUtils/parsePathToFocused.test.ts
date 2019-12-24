// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parsePathToFocused } from '../../../src/utils/convertUtils';

describe('parsePathToFocused', () => {
  it('should return focusedPath', () => {
    expect(parsePathToFocused('')).toBe('');
    expect(parsePathToFocused('main.trigers[0].actions[0]')).toBe('trigers[0].actions[0]');
    expect(parsePathToFocused('main.trigers[0].actions[0].actions[1]')).toBe('trigers[0].actions[0].actions[1]');
    expect(parsePathToFocused('main.trigers[0].actions[0].elseActions[1]')).toBe(
      'trigers[0].actions[0].elseActions[1]'
    );
  });
});
