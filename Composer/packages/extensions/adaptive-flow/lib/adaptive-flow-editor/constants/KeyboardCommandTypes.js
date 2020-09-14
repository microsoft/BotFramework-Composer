// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from "tslib";
import { EditorConfig } from './editorConfig';
export var KeyboardCommandTypes = {
    Cursor: {
        MoveUp: 'cursor move up',
        MoveDown: 'cursor move down',
        MoveLeft: 'cursor move left',
        MoveRight: 'cursor move right',
        ShortMoveUp: 'cursor move up shorter',
        ShortMoveDown: 'cursor move down shorter',
        ShortMoveLeft: 'cursor move left shorter',
        ShortMoveRight: 'cursor move right shorter',
        MovePrevious: 'cursor move previous',
        MoveNext: 'cursor move next',
    },
    Node: {
        Delete: 'delete node',
        Copy: 'copy',
        Cut: 'cut',
        Paste: 'paste',
    },
    Operation: {
        Redo: 'redo',
        Undo: 'undo',
    },
};
var findCommandAreaByValue = (function () {
    // Construct a inverted index to find shortcut area quickly.
    var cmdAreaByValue = {};
    var areaKeys = Object.keys(KeyboardCommandTypes);
    for (var _i = 0, areaKeys_1 = areaKeys; _i < areaKeys_1.length; _i++) {
        var areaKey = areaKeys_1[_i];
        var cmdsUnderArea = KeyboardCommandTypes[areaKey];
        var cmdValues = Object.values(cmdsUnderArea);
        for (var _a = 0, cmdValues_1 = cmdValues; _a < cmdValues_1.length; _a++) {
            var cmd = cmdValues_1[_a];
            cmdAreaByValue[cmd] = areaKey;
        }
    }
    return function (command) { return cmdAreaByValue[command]; };
})();
export var KeyboardPrimaryTypes = {
    Cursor: 'Cursor',
    Node: 'Node',
    Operation: 'Operation',
};
var BasicShortcuts = {
    'Windows.Delete': KeyboardCommandTypes.Node.Delete,
    'Mac.Delete': KeyboardCommandTypes.Node.Delete,
};
var TabNavShortcuts = {
    'Windows.Tab': KeyboardCommandTypes.Cursor.MoveNext,
    'Windows.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
    'Mac.Tab': KeyboardCommandTypes.Cursor.MoveNext,
    'Mac.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
};
var ArrowMoveShortcuts = {
    'Windows.ArrowUp': KeyboardCommandTypes.Cursor.MoveUp,
    'Windows.ArrowDown': KeyboardCommandTypes.Cursor.MoveDown,
    'Windows.ArrowLeft': KeyboardCommandTypes.Cursor.MoveLeft,
    'Windows.ArrowRight': KeyboardCommandTypes.Cursor.MoveRight,
    'Windows.Shift.ArrowUp': KeyboardCommandTypes.Cursor.ShortMoveUp,
    'Windows.Shift.ArrowDown': KeyboardCommandTypes.Cursor.ShortMoveDown,
    'Windows.Shift.ArrowLeft': KeyboardCommandTypes.Cursor.ShortMoveLeft,
    'Windows.Shift.ArrowRight': KeyboardCommandTypes.Cursor.ShortMoveRight,
    'Mac.ArrowUp': KeyboardCommandTypes.Cursor.MoveUp,
    'Mac.ArrowDown': KeyboardCommandTypes.Cursor.MoveDown,
    'Mac.ArrowLeft': KeyboardCommandTypes.Cursor.MoveLeft,
    'Mac.ArrowRight': KeyboardCommandTypes.Cursor.MoveRight,
    'Mac.Shift.ArrowUp': KeyboardCommandTypes.Cursor.ShortMoveUp,
    'Mac.Shift.ArrowDown': KeyboardCommandTypes.Cursor.ShortMoveDown,
    'Mac.Shift.ArrowLeft': KeyboardCommandTypes.Cursor.ShortMoveLeft,
    'Mac.Shift.ArrowRight': KeyboardCommandTypes.Cursor.ShortMoveRight,
};
var KeyboardNodeEditingShortcuts = {
    'Windows.Control.C': KeyboardCommandTypes.Node.Copy,
    'Windows.Control.c': KeyboardCommandTypes.Node.Copy,
    'Windows.Control.X': KeyboardCommandTypes.Node.Cut,
    'Windows.Control.x': KeyboardCommandTypes.Node.Cut,
    'Windows.Control.V': KeyboardCommandTypes.Node.Paste,
    'Windows.Control.v': KeyboardCommandTypes.Node.Paste,
    'Mac.Meta.C': KeyboardCommandTypes.Node.Copy,
    'Mac.Meta.c': KeyboardCommandTypes.Node.Copy,
    'Mac.Meta.X': KeyboardCommandTypes.Node.Cut,
    'Mac.Meta.x': KeyboardCommandTypes.Node.Cut,
    'Mac.Meta.V': KeyboardCommandTypes.Node.Paste,
    'Mac.Meta.v': KeyboardCommandTypes.Node.Paste,
};
var KeyboardOperationEditingShortcuts = {
    'Windows.Control.Z': KeyboardCommandTypes.Operation.Undo,
    'Windows.Control.z': KeyboardCommandTypes.Operation.Undo,
    'Windows.Control.Shift.Z': KeyboardCommandTypes.Operation.Redo,
    'Windows.Control.Shift.z': KeyboardCommandTypes.Operation.Redo,
    'Mac.Meta.Z': KeyboardCommandTypes.Operation.Undo,
    'Mac.Meta.z': KeyboardCommandTypes.Operation.Undo,
    'Mac.Meta.Shift.Z': KeyboardCommandTypes.Operation.Redo,
    'Mac.Meta.Shift.z': KeyboardCommandTypes.Operation.Redo,
};
var _a = EditorConfig.features, arrowNavigation = _a.arrowNavigation, tabNavigation = _a.tabNavigation, keyboardNodeEditing = _a.keyboardNodeEditing, keyboardOperationEditing = _a.keyboardOperationEditing;
var SupportedShortcuts = __assign(__assign(__assign(__assign(__assign({}, BasicShortcuts), (arrowNavigation ? ArrowMoveShortcuts : null)), (tabNavigation ? TabNavShortcuts : null)), (keyboardNodeEditing ? KeyboardNodeEditingShortcuts : null)), (keyboardOperationEditing ? KeyboardOperationEditingShortcuts : null));
export function mapShortcutToKeyboardCommand(keyCode) {
    var command = SupportedShortcuts[keyCode];
    var area = findCommandAreaByValue(command);
    return { area: area, command: command };
}
//# sourceMappingURL=KeyboardCommandTypes.js.map