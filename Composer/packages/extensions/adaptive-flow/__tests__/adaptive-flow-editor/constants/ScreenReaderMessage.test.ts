// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScreenReaderMessage } from '../../../src/adaptive-flow-editor/constants/ScreenReaderMessage';

describe('ScreenReaderMessage', () => {
  it('should contain necessary messages.', () => {
    expect(ScreenReaderMessage.EventFocused).toBeTruthy();
    expect(ScreenReaderMessage.ActionFocused).toBeTruthy();
    expect(ScreenReaderMessage.ActionUnfocused).toBeTruthy();
    expect(ScreenReaderMessage.RangeSelection).toBeTruthy();
    expect(ScreenReaderMessage.DialogOpened).toBeTruthy();
    expect(ScreenReaderMessage.ActionDeleted).toBeTruthy();
    expect(ScreenReaderMessage.ActionsDeleted).toBeTruthy();
    expect(ScreenReaderMessage.ActionCreated).toBeTruthy();
    expect(ScreenReaderMessage.ActionsCreated).toBeTruthy();
    expect(ScreenReaderMessage.EventCreated).toBeTruthy();
    expect(ScreenReaderMessage.ActionsCopied).toBeTruthy();
    expect(ScreenReaderMessage.ActionsCut).toBeTruthy();
    expect(ScreenReaderMessage.ActionsMoved).toBeTruthy();
    expect(ScreenReaderMessage.ActionUndo).toBeTruthy();
    expect(ScreenReaderMessage.ActionRedo).toBeTruthy();
  });
});
