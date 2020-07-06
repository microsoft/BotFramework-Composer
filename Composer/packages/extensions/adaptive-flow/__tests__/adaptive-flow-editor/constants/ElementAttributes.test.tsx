// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttrNames } from '../../../src/adaptive-flow-editor/constants/ElementAttributes';

describe('ElementAttributes', () => {
  it('should contain necessary attrs.', () => {
    expect(AttrNames.SelectableElement).toBeTruthy();
    expect(AttrNames.NodeElement).toBeTruthy();
    expect(AttrNames.EdgeMenuElement).toBeTruthy();
    expect(AttrNames.FocusedId).toBeTruthy();
    expect(AttrNames.InlineLinkElement).toBeTruthy();
    expect(AttrNames.SelectedId).toBeTruthy();
    expect(AttrNames.Tab).toBeTruthy();
    expect(AttrNames.FocusedId).toBeTruthy();
    expect(AttrNames.SelectionIndex).toBeTruthy();
  });
});
