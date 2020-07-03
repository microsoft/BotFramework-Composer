// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mapKeyboardCommandToEditorEvent } from '../../../src/adaptive-flow-editor/utils/mapKeyboardCommandToEditorEvent';
import {
  KeyboardPrimaryTypes,
  KeyboardCommandTypes,
} from '../../../src/adaptive-flow-editor/constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../../../src/adaptive-flow-renderer/constants/NodeEventTypes';

describe('mapKeyboardCommandToEditorEvent()', () => {
  it('can map event to correct result.', () => {
    const validationChart = {
      [KeyboardPrimaryTypes.Node]: {
        [KeyboardCommandTypes.Node.Delete]: NodeEventTypes.DeleteSelection,
        [KeyboardCommandTypes.Node.Copy]: NodeEventTypes.CopySelection,
        [KeyboardCommandTypes.Node.Cut]: NodeEventTypes.CutSelection,
        [KeyboardCommandTypes.Node.Paste]: NodeEventTypes.PasteSelection,
      },
      [KeyboardPrimaryTypes.Operation]: {
        [KeyboardCommandTypes.Operation.Undo]: NodeEventTypes.Undo,
        [KeyboardCommandTypes.Operation.Redo]: NodeEventTypes.Redo,
      },
    };

    Object.keys(validationChart).forEach((area) => {
      const subchart = validationChart[area];
      Object.keys(subchart).forEach((command) => {
        const resultType = subchart[command];
        expect(mapKeyboardCommandToEditorEvent({ area, command })?.type).toEqual(resultType);
      });
    });
  });
});
