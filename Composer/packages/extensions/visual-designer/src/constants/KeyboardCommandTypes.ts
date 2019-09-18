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
  },
};

export const KeyboardPrimaryTypes = {
  Cursor: 'Cursor',
  Node: 'Node',
};

// Map system name and keyboard key
const SystemKeyboardCommandTypes = {
  // Windows keyboard shotcuts
  'Windows.ArrowUp': KeyboardCommandTypes.Cursor.MoveUp,
  'Windows.ArrowDown': KeyboardCommandTypes.Cursor.MoveDown,
  'Windows.ArrowLeft': KeyboardCommandTypes.Cursor.MoveLeft,
  'Windows.ArrowRight': KeyboardCommandTypes.Cursor.MoveRight,
  'Windows.Shift.ArrowUp': KeyboardCommandTypes.Cursor.ShortMoveUp,
  'Windows.Shift.ArrowDown': KeyboardCommandTypes.Cursor.ShortMoveDown,
  'Windows.Shift.ArrowLeft': KeyboardCommandTypes.Cursor.ShortMoveLeft,
  'Windows.Shift.ArrowRight': KeyboardCommandTypes.Cursor.ShortMoveRight,
  'Windows.Tab': KeyboardCommandTypes.Cursor.MoveNext,
  'Windows.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
  'Windows.Delete': KeyboardCommandTypes.Node.Delete,

  // Mac keyboard shotcuts
  'Mac.ArrowUp': KeyboardCommandTypes.Cursor.MoveUp,
  'Mac.ArrowDown': KeyboardCommandTypes.Cursor.MoveDown,
  'Mac.ArrowLeft': KeyboardCommandTypes.Cursor.MoveLeft,
  'Mac.ArrowRight': KeyboardCommandTypes.Cursor.MoveRight,
  'Mac.Shift.ArrowUp': KeyboardCommandTypes.Cursor.ShortMoveUp,
  'Mac.Shift.ArrowDown': KeyboardCommandTypes.Cursor.ShortMoveDown,
  'Mac.Shift.ArrowLeft': KeyboardCommandTypes.Cursor.ShortMoveLeft,
  'Mac.Shift.ArrowRight': KeyboardCommandTypes.Cursor.ShortMoveRight,
  'Mac.Tab': KeyboardCommandTypes.Cursor.MoveNext,
  'Mac.Shift.Tab': KeyboardCommandTypes.Cursor.MovePrevious,
  'Mac.Delete': KeyboardCommandTypes.Node.Delete,
};

export function findCommand(keyCode) {
  const command = SystemKeyboardCommandTypes[keyCode];
  let commands: { [key: string]: string };
  let primaryType = '';
  let commandKey: string | undefined;
  Object.keys(KeyboardCommandTypes).forEach(key => {
    commands = KeyboardCommandTypes[key];
    Object.keys(commands).forEach(action => {
      if (commands[action] === command) {
        commandKey = action;
        primaryType = key;
      }
    });
  });

  if (commandKey) {
    return { primaryType, command };
  } else {
    return {};
  }
}
