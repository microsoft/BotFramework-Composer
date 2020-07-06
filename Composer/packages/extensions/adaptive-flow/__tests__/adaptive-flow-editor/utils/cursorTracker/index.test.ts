// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { moveCursor } from '../../../../src/adaptive-flow-editor/utils/cursorTracker';
import { KeyboardCommandTypes } from '../../../../src/adaptive-flow-editor/constants/KeyboardCommandTypes';

describe('moveCursor', () => {
  it('returns undfined when no selectableElements.', () => {
    expect(moveCursor([], 'test', KeyboardCommandTypes.Cursor.MovePrevious)).toEqual({
      selected: 'test',
      focused: undefined,
    });
  });

  it('can handle Tab move.', () => {
    expect(
      moveCursor(
        [
          {
            selectedId: 'test',
            focusedId: 'test-focused',
            bounds: { left: 0, top: 0, right: 10, bottom: 10 },
          } as any,
        ],
        'test',
        KeyboardCommandTypes.Cursor.MoveNext
      )
    ).toEqual({ focused: 'test-focused', selected: 'test', tab: '' });
  });

  it('can handle Arrow move.', () => {
    expect(
      moveCursor(
        [
          {
            selectedId: 'test',
            focusedId: 'test-focused',
            bounds: { left: 0, top: 0, right: 10, bottom: 10 },
          } as any,
        ],
        'test',
        KeyboardCommandTypes.Cursor.MoveLeft
      )
    ).toEqual({ focused: 'test-focused', selected: 'test', tab: '' });
  });
});
