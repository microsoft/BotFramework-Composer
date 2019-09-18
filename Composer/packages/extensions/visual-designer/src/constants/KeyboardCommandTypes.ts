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
}

export function findCommand(keyCode) {
  return SystemKeyboardCommandTypes[keyCode];
}
