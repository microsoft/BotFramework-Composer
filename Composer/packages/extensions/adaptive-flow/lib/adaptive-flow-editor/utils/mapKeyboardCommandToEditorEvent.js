// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { KeyboardPrimaryTypes, KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
export var mapKeyboardCommandToEditorEvent = function (_a) {
    var area = _a.area, command = _a.command;
    switch (area) {
        case KeyboardPrimaryTypes.Node:
            switch (command) {
                case KeyboardCommandTypes.Node.Delete:
                    return { type: NodeEventTypes.DeleteSelection };
                case KeyboardCommandTypes.Node.Copy:
                    return { type: NodeEventTypes.CopySelection };
                case KeyboardCommandTypes.Node.Cut:
                    return { type: NodeEventTypes.CutSelection };
                case KeyboardCommandTypes.Node.Paste: {
                    return { type: NodeEventTypes.PasteSelection };
                }
            }
            break;
        case KeyboardPrimaryTypes.Cursor: {
            return { type: NodeEventTypes.MoveCursor, payload: { command: command } };
        }
        case KeyboardPrimaryTypes.Operation: {
            switch (command) {
                case KeyboardCommandTypes.Operation.Undo:
                    return { type: NodeEventTypes.Undo, payload: {} };
                case KeyboardCommandTypes.Operation.Redo:
                    return { type: NodeEventTypes.Redo, payload: {} };
            }
            break;
        }
        default:
            break;
    }
};
//# sourceMappingURL=mapKeyboardCommandToEditorEvent.js.map