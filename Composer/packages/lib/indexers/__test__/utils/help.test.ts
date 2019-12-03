// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getBaseName } from '../../src/utils/help';

describe('get base name', () => {
  it('should get corrent base name', () => {
    const n1 = getBaseName('b.c', '.c');
    const n2 = getBaseName('b.c');
    const n3 = getBaseName('b');
    const n4 = getBaseName('a.b.c');
    const n5 = getBaseName('a.b.c', 'd');
    expect(n1).toBe('b');
    expect(n2).toBe('b');
    expect(n3).toBe('b');
    expect(n4).toBe('a.b');
    expect(n5).toBe('');
  });
});
