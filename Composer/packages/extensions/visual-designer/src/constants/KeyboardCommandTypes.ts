export enum KeyboardCommandTypes {
  DeleteNode = 'delete node',
  Copy = 'copy',
  Cut = 'cut',
  Paste = 'paste',
}

// Map system name and keyboard key
enum SystemKeyboardCommandTypes {
  // Windows keyboard shotcuts
  'Windows.Delete' = KeyboardCommandTypes.DeleteNode,

  // Mac keyboard shotcuts
  'Mac.Delete' = KeyboardCommandTypes.DeleteNode,

  // Copy paste
  'Windows.Control.C' = KeyboardCommandTypes.Copy,
  'Windows.Control.c' = KeyboardCommandTypes.Copy,
  'Windows.Control.X' = KeyboardCommandTypes.Cut,
  'Windows.Control.x' = KeyboardCommandTypes.Cut,
  'Windows.Control.V' = KeyboardCommandTypes.Paste,
  'Windows.Control.v' = KeyboardCommandTypes.Paste,
}

export function findCommand(keyCode) {
  return SystemKeyboardCommandTypes[keyCode];
}
