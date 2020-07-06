// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { parsePathToSelected } from '../../../src/utils/convertUtils/parsePathToSelected';

describe('parsePathToSelected', () => {
  it('should return selected path', () => {
    expect(parsePathToSelected('')).toBe('');
    expect(parsePathToSelected('main.triggers[0].actions[0]')).toBe('triggers[0]');
    expect(parsePathToSelected('main')).toBe('');
    expect(parsePathToSelected('main.triggers[0]')).toBe('triggers[0]');
  });
});
