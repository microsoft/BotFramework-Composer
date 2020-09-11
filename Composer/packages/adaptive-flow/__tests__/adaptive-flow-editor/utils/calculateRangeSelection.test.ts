// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateRangeSelection } from '../../../src/adaptive-flow-editor/utils/calculateRangeSelection';

describe('calculateRangeSelection()', () => {
  it('could pick correct range.', () => {
    expect(calculateRangeSelection('b', 'd', ['a', 'b', 'c', 'd'])).toEqual(['b', 'c', 'd']);
    expect(calculateRangeSelection('d', 'b', ['a', 'b', 'c', 'd'])).toEqual(['b', 'c', 'd']);
  });
});
