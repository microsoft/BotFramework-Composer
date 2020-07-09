// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SelectorElement,
  Direction,
  BoundRect,
  Axle,
} from '../../../../src/adaptive-flow-editor/utils/cursorTracker/type';

describe('types', () => {
  it('should be declared.', () => {
    expect(SelectorElement).toBeTruthy();
    expect(Direction).toBeTruthy();
    expect(BoundRect).toBeTruthy();
    expect(Axle).toBeTruthy();
  });
});
