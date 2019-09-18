export enum KeyboardCommandTypes {
  Delete = 'delete',
  Copy = 'copy',
  Cut = 'cut',
  Paste = 'paste',
}

// Map system name and keyboard key
enum SystemKeyboardCommandTypes {
  // Windows keyboard shotcuts
  'Windows.Delete' = KeyboardCommandTypes.Delete,

  // Mac keyboard shotcuts
  'Mac.Delete' = KeyboardCommandTypes.Delete,
}

export function findCommand(keyCode) {
  return SystemKeyboardCommandTypes[keyCode];
}
