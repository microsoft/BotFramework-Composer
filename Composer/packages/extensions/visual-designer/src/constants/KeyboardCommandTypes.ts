export enum KeyboardCommandTypes {
  MoveUp = 'cursor move up',
  MoveDown = 'cursor move down',
  MoveLeft = 'cursor move left',
  MoveRight = 'cursor move right',
  MovePrevious = 'cursor move previous',
  MoveNext = 'cursor move next',
  DeleteNode = 'delete node',
}

// Map system name and keyboard key
enum SystemKeyboardCommandTypes {
  // Windows keyboard shotcuts
  'Windows.ArrowUp' = KeyboardCommandTypes.MoveUp,
  'Windows.ArrowDown' = KeyboardCommandTypes.MoveDown,
  'Windows.ArrowLeft' = KeyboardCommandTypes.MoveLeft,
  'Windows.ArrowRight' = KeyboardCommandTypes.MoveRight,
  'Windows.Tab' = KeyboardCommandTypes.MoveNext,
  'Windows.Shift.Tab' = KeyboardCommandTypes.MovePrevious,
  'Windows.Delete' = KeyboardCommandTypes.DeleteNode,

  // Mac keyboard shotcuts
  'Mac.ArrowUp' = KeyboardCommandTypes.MoveUp,
  'Mac.ArrowDown' = KeyboardCommandTypes.MoveDown,
  'Mac.ArrowLeft' = KeyboardCommandTypes.MoveLeft,
  'Mac.ArrowRight' = KeyboardCommandTypes.MoveRight,
  'Mac.Tab' = KeyboardCommandTypes.MoveNext,
  'Mac.Shift.Tab' = KeyboardCommandTypes.MovePrevious,
  'Mac.Delete' = KeyboardCommandTypes.DeleteNode,
}

export function findCommand(keyCode) {
  return SystemKeyboardCommandTypes[keyCode];
}
