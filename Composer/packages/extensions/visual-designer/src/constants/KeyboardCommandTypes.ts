import { EditorConfig } from '../editors/editorConfig';

export const KeyboardCommandTypes = {
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

const findCommandAreaByValue = (() => {
  // Construct a inverted index to find shortcut area quickly.
  const cmdAreaByValue: { [_: string]: string } = {};
  const areaKeys = Object.keys(KeyboardCommandTypes);

  for (const areaKey of areaKeys) {
    const cmdsUnderArea = KeyboardCommandTypes[areaKey];
    const cmdValues: string[] = Object.values(cmdsUnderArea);
    for (const cmd of cmdValues) {
      cmdAreaByValue[cmd] = areaKey;
    }
  }

  return (command: string) => cmdAreaByValue[command];
})();

export const KeyboardPrimaryTypes = {
  Cursor: 'Cursor',
  Node: 'Node',
  Operation: 'Operation',
};

const BasicShortcuts = {
  'Windows.Delete': KeyboardCommandTypes.Node.Delete,
  'Mac.Delete': KeyboardCommandTypes.Node.Delete,
};

const TabNavShortcuts = {
  'Windows.Tab': KeyboardCommandTypes.Cursor.MoveNext,
  'Windows.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
  'Mac.Tab': KeyboardCommandTypes.Cursor.MoveNext,
  'Mac.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
};

const ArrowMoveShortcuts = {
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

const KeyboardNodeEditingShortcuts = {
  'Windows.Control.C': KeyboardCommandTypes.Node.Copy,
  'Windows.Control.c': KeyboardCommandTypes.Node.Copy,
  'Windows.Control.X': KeyboardCommandTypes.Node.Cut,
  'Windows.Control.x': KeyboardCommandTypes.Node.Cut,

  'Mac.Meta.C': KeyboardCommandTypes.Node.Copy,
  'Mac.Meta.c': KeyboardCommandTypes.Node.Copy,
  'Mac.Meta.X': KeyboardCommandTypes.Node.Cut,
  'Mac.Meta.x': KeyboardCommandTypes.Node.Cut,
};

const KeyboardOperationEditingShortcuts = {
  'Windows.Control.Z': KeyboardCommandTypes.Operation.Undo,
  'Windows.Control.z': KeyboardCommandTypes.Operation.Undo,
  'Windows.Control.Shift.Z': KeyboardCommandTypes.Operation.Redo,
  'Windows.Control.Shift.z': KeyboardCommandTypes.Operation.Redo,

  'Mac.Meta.Z': KeyboardCommandTypes.Operation.Undo,
  'Mac.Meta.z': KeyboardCommandTypes.Operation.Undo,
  'Mac.Meta.Shift.Z': KeyboardCommandTypes.Operation.Redo,
  'Mac.Meta.Shift.z': KeyboardCommandTypes.Operation.Redo,
};

const { arrowNavigation, tabNavigation, keyboardNodeEditing, keyboardOperationEditing } = EditorConfig.features;

const SupportedShortcuts = {
  ...BasicShortcuts,
  ...(arrowNavigation ? ArrowMoveShortcuts : null),
  ...(tabNavigation ? TabNavShortcuts : null),
  ...(keyboardNodeEditing ? KeyboardNodeEditingShortcuts : null),
  ...(keyboardOperationEditing ? KeyboardOperationEditingShortcuts : null),
};

export function mapShortcutToKeyboardCommand(keyCode) {
  const command = SupportedShortcuts[keyCode];
  const area = findCommandAreaByValue(command);

  return { area, command };
}
