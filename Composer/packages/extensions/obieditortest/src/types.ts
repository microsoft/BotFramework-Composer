export enum MemoryScope {
  user = 'user',
  conversation = 'conversation',
  dialog = 'dialog',
  turn = 'turn',
}
interface MemoryBag {
  [key: string]: any;
}

export interface FormMemory {
  [MemoryScope.user]: MemoryBag;
  [MemoryScope.conversation]: MemoryBag;
  [MemoryScope.dialog]: MemoryBag;
  [MemoryScope.turn]: MemoryBag;
}

export interface DialogInfo {
  name: string;
}

export interface FormData {
  $type?: string;
  [key: string]: any;
}

export interface ShellApi {
  getData: <T = any>() => Promise<T>;
  getDialogs: <T = any>() => Promise<T>;
  saveData: <T = any>(newData: T) => Promise<void>;
  navTo: (path: string) => Promise<void>;
  navDown: (path: string) => Promise<void>;
  focusTo: (path: string) => Promise<void>;
}
