export enum KeyboardCommandTypes {
  MoveUp = 'cursor move up',
  MoveDown = 'cursor move down',
  MoveLeft = 'cursor move left',
  MoveRight = 'cursor move right',
  ShortMoveUp = 'cursor move up shorter',
  ShortMoveDown = 'cursor move down shorter',
  ShortMoveLeft = 'cursor move left shorter',
  ShortMoveRight = 'cursor move right shorter',
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
  'Windows.Shift.ArrowUp' = KeyboardCommandTypes.ShortMoveUp,
  'Windows.Shift.ArrowDown' = KeyboardCommandTypes.ShortMoveDown,
  'Windows.Shift.ArrowLeft' = KeyboardCommandTypes.ShortMoveLeft,
  'Windows.Shift.ArrowRight' = KeyboardCommandTypes.ShortMoveRight,
  'Windows.Tab' = KeyboardCommandTypes.MoveNext,
  'Windows.Shift.Tab' = KeyboardCommandTypes.MovePrevious,
  'Windows.Delete' = KeyboardCommandTypes.DeleteNode,

  // Mac keyboard shotcuts
  'Mac.ArrowUp' = KeyboardCommandTypes.MoveUp,
  'Mac.ArrowDown' = KeyboardCommandTypes.MoveDown,
  'Mac.ArrowLeft' = KeyboardCommandTypes.MoveLeft,
  'Mac.ArrowRight' = KeyboardCommandTypes.MoveRight,
  'Mac.Shift.ArrowUp' = KeyboardCommandTypes.ShortMoveUp,
  'Mac.Shift.ArrowDown' = KeyboardCommandTypes.ShortMoveDown,
  'Mac.Shift.ArrowLeft' = KeyboardCommandTypes.ShortMoveLeft,
  'Mac.Shift.ArrowRight' = KeyboardCommandTypes.ShortMoveRight,
  'Mac.Tab' = KeyboardCommandTypes.MoveNext,
  'Mac.Shift.Tab' = KeyboardCommandTypes.MovePrevious,
  'Mac.Delete' = KeyboardCommandTypes.DeleteNode,
}

export function findCommand(keyCode) {
  return SystemKeyboardCommandTypes[keyCode];
}
