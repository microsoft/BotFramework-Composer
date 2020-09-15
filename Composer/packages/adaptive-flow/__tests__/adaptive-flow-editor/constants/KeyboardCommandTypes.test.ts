// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  KeyboardCommandTypes,
  KeyboardPrimaryTypes,
  mapShortcutToKeyboardCommand,
} from '../../../src/adaptive-flow-editor/constants/KeyboardCommandTypes';

describe('KeyboardCommandTypes', () => {
  it('should be truthy.', () => {
    expect(KeyboardCommandTypes).toBeTruthy();
  });

  it('should contain 3 categories.', () => {
    expect(KeyboardCommandTypes.Cursor).toBeTruthy();
    expect(KeyboardCommandTypes.Node).toBeTruthy();
    expect(KeyboardCommandTypes.Operation).toBeTruthy();
  });

  it('<Cursor> should contain necessary commands.', () => {
    const { Cursor } = KeyboardCommandTypes;

    expect(Cursor.MoveUp).toBeTruthy();
    expect(Cursor.MoveDown).toBeTruthy();
    expect(Cursor.MoveLeft).toBeTruthy();
    expect(Cursor.MoveRight).toBeTruthy();
    expect(Cursor.ShortMoveUp).toBeTruthy();
    expect(Cursor.ShortMoveDown).toBeTruthy();
    expect(Cursor.ShortMoveLeft).toBeTruthy();
    expect(Cursor.ShortMoveRight).toBeTruthy();
    expect(Cursor.MovePrevious).toBeTruthy();
    expect(Cursor.MoveNext).toBeTruthy();
  });

  it('<Node> should contain necessary actions.', () => {
    const { Node } = KeyboardCommandTypes;

    expect(Node.Delete).toBeTruthy();
    expect(Node.Copy).toBeTruthy();
    expect(Node.Cut).toBeTruthy();
    expect(Node.Paste).toBeTruthy();
  });

  it('<Operation> should contain necessary operations.', () => {
    const { Operation } = KeyboardCommandTypes;

    expect(Operation.Undo).toBeTruthy();
    expect(Operation.Redo).toBeTruthy();
  });
});

describe('KeyboardPrimaryTypes', () => {
  it('should contain 3 types.', () => {
    expect(KeyboardPrimaryTypes.Cursor).toBeTruthy();
    expect(KeyboardPrimaryTypes.Node).toBeTruthy();
    expect(KeyboardPrimaryTypes.Operation).toBeTruthy();
  });
});

describe('mapShortcutToKeyboardCommand', () => {
  expect(mapShortcutToKeyboardCommand('Windows.Control.Z')).toEqual({
    area: 'Operation',
    command: 'undo',
  });
});
