// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parsePathToFocused } from '../parsePathToFocused';

describe('parsePathToFocused', () => {
  it('should return focusedPath', () => {
    expect(parsePathToFocused('')).toBe('');
    expect(parsePathToFocused('main.triggers[0].actions[0]')).toBe('triggers[0].actions[0]');
    expect(parsePathToFocused('main.triggers[0].actions[0].actions[1]')).toBe('triggers[0].actions[0].actions[1]');
    expect(parsePathToFocused('main.triggers[0].actions[0].elseActions[1]')).toBe(
      'triggers[0].actions[0].elseActions[1]'
    );
  });
});
