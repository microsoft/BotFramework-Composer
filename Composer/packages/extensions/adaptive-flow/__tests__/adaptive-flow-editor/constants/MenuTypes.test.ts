// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MenuTypes, MenuEventTypes } from '../../../src/adaptive-flow-editor/constants/MenuTypes';

describe('MenuTypes', () => {
  it('should contain necessary keys.', () => {
    expect(MenuTypes.EdgeMenu).toBeTruthy();
    expect(MenuTypes.NodeMenu).toBeTruthy();
    expect(MenuEventTypes.Paste).toBeTruthy();
  });
});
