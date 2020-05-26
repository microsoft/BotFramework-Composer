// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isCircular, CIRCULAR_REFS } from '../../src/schemaUtils/circular';

describe('isCircular', () => {
  it('returns true for kinds in CIRCULAR_REFS', () => {
    CIRCULAR_REFS.forEach((k) => {
      expect(isCircular(k)).toBe(true);
    });
  });

  it('matches on internal refs', () => {
    expect(isCircular('Microsoft.AdaptiveDialog/properties/schema/anyOf/0')).toBe(true);
  });
});
