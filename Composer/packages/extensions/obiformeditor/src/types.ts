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
  id: string;
  displayName: string;
  isRoot: boolean;
  content: MicrosoftAdaptiveDialog;
}

export interface Intent {
  name: string;
}

export interface Utterance {
  intent: string;
  text: string;
}

export interface LuFile {
  id: string;
  relativePath: string;
  content: string;
  parsedContent: {
    LUISJsonStructure: {
      intents: Intent[];
      utterances: Utterance[];
    };
  };
}

export interface LgFile {
  id: string;
  relativePath: string;
  content: string;
}
export interface LgTemplate {
  Name: string;
  Body: string;
}

export interface FormData {
  $type?: string;
  [key: string]: any;
}

export interface ShellApi {
  getState: <T = any>() => Promise<T>;
  getDialogs: <T = any>() => Promise<T>;
  saveData: <T = any>(newData: T, updatePath: string) => Promise<void>;
  navTo: (path: string) => Promise<void>;
  onFocusSteps: (stepIds: string[]) => Promise<void>;
  onFocusEvent: (eventId: string) => Promise<void>;
  createLuFile: (id: string) => Promise<void>;
  updateLuFile: (id: string, content: string) => Promise<void>;
  getLgTemplates: (id: string) => Promise<LgTemplate[]>;
  createLgTemplate: (id: string, template: LgTemplate, position: number) => Promise<void>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<void>;
  removeLgTemplate: (id: string, templateName: string) => Promise<void>;
  createDialog: () => Promise<string>;
  validateExpression: (expression?: string) => Promise<boolean>;
}
export interface EditorSchema {
  editor: {
    content?: {
      fieldTemplateOverrides?: any;
      SDKOverrides?: any;
    };
  };
}

declare module 'json-schema' {
  interface OBISchema {
    $role?: string;
    $type?: string;
    $copy?: string;
    $id?: string;
    $designer?: {
      [key: string]: any;
    };
  }

  interface JSONSchema6 extends OBISchema {
    title?: string;
    __additional_property?: boolean;
  }
}
