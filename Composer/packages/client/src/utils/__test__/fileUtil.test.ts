// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getUniqueName } from '../fileUtil';

describe('File utils', () => {
  it('should get a unique name', () => {
    const uniqueName = getUniqueName(['test', 'test-1', 'test-2', 'test-3'], 'test');
    expect(uniqueName).toBe('test-4');
  });
});
