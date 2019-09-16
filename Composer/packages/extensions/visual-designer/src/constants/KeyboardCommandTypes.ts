export enum KeyboardCommandTypes {
  DeleteNode = 'delete node',
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
