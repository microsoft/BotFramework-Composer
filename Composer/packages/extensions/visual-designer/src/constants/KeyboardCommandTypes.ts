export enum KeyboardCommandTypes {
  MoveUp = 'cursor move up',
  MoveDown = 'cursor move down',
  MoveLeft = 'cursor move left',
  MoveRight = 'cursor move right',
  DeleteNode = 'delete node',
}

// Map system name and keyboard key
export enum SystemKeyboardCommandTypes {
  // Windows keyboard shotcuts
  'Windows.ArrowUp' = KeyboardCommandTypes.MoveUp,
  'Windows.ArrowDown' = KeyboardCommandTypes.MoveDown,
  'Windows.ArrowLeft' = KeyboardCommandTypes.MoveLeft,
  'Windows.ArrowRight' = KeyboardCommandTypes.MoveRight,
  'Windows.Delete' = KeyboardCommandTypes.DeleteNode,

  // Mac keyboard shotcuts
  'Mac.ArrowUp' = KeyboardCommandTypes.MoveUp,
  'Mac.ArrowDown' = KeyboardCommandTypes.MoveDown,
  'Mac.ArrowLeft' = KeyboardCommandTypes.MoveLeft,
  'Mac.ArrowRight' = KeyboardCommandTypes.MoveRight,
  'Mac.Delete' = KeyboardCommandTypes.DeleteNode,
}
