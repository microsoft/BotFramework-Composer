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

export interface LuFile {
  id: string;
  absolutePath: string;
  content: string;
}

export interface FormData {
  $type?: string;
  [key: string]: any;
}

export interface ShellApi {
  getState: <T = any>() => Promise<T>;
  getDialogs: <T = any>() => Promise<T>;
  saveData: <T = any>(newData: T) => Promise<void>;
  navTo: (path: string) => Promise<void>;
  navDown: (path: string) => Promise<void>;
  focusTo: (path: string) => Promise<void>;
}
export interface EditorSchema {
  editor: {
    content?: {
      fieldTemplateOverrides?: any;
      SDKOverrides?: any;
    };
  };
}
