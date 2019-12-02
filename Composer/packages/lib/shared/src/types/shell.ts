// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic as LGDiagnostic } from 'botbuilder-lg';

import { MicrosoftAdaptiveDialog } from './sdk';

export interface FileInfo {
  name: string;
  content: string;
  path: string;
  relativePath: string;
}

export interface ITrigger {
  id: string;
  displayName: string;
  type: string;
  isIntent: boolean;
}

export interface DialogInfo {
  content: MicrosoftAdaptiveDialog;
  diagnostics: string[];
  displayName: string;
  id: string;
  isRoot: boolean;
  lgFile: string;
  lgTemplates: string[];
  luFile: string;
  luIntents: string[];
  referredDialogs: string[];
  relativePath: string;
  triggers: ITrigger[];
}

export interface EditorSchema {
  content?: {
    fieldTemplateOverrides?: any;
    SDKOverrides?: any;
  };
}

export interface BotSchemas {
  editor: EditorSchema;
  sdk?: any;
  diagnostics?: any[];
}

export interface Intent {
  name: string;
}

export interface Utterance {
  intent: string;
  text: string;
}

export interface LuDiagnostic {
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
  diagnostics: LuDiagnostic[];
  [key: string]: any;
}

export interface LgFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: LGDiagnostic[];
  templates: LgTemplate[];
}

export interface CodeRange {
  startLineNumber: number;
  endLineNumber: number;
}

export interface LgTemplate {
  name: string;
  body: string;
  parameters: string[];
  range: CodeRange;
}

export interface ShellData {
  botName: string;
  currentDialog: DialogInfo;
  data: {
    $type: string;
    [key: string]: any;
  };
  dialogId: string;
  dialogs: DialogInfo[];
  focusedEvent: string;
  focusedActions: string[];
  focusedSteps: string[];
  focusedTab?: string;
  focusPath: string;
  clipboardActions: any[];
  hosted: boolean;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  schemas: BotSchemas;
}

export interface ShellApi {
  getState: <T = any>() => Promise<T>;
  saveData: <T = any>(newData: T, updatePath?: string) => Promise<void>;
  navTo: (path: string, rest?: any) => Promise<void>;
  onFocusSteps: (stepIds: string[], focusedTab?: string) => Promise<void>;
  onFocusEvent: (eventId: string) => Promise<void>;
  onSelect: (ids: string[]) => Promise<void>;
  createLuFile: (id: string) => Promise<void>;
  updateLuFile: (luFile: { id: string; content: string }) => Promise<void>;
  updateLgFile: (id: string, content: string) => Promise<void>;
  getLgTemplates: (id: string) => Promise<LgTemplate[]>;
  copyLgTemplate: (id: string, fromTemplateName: string, toTemplateName?: string) => Promise<string>;
  createLgTemplate: (id: string, template: Partial<LgTemplate>, position: number) => Promise<void>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<void>;
  removeLgTemplate: (id: string, templateName: string) => Promise<void>;
  removeLgTemplates: (id: string, templateNames: string[]) => Promise<void>;
  createDialog: () => Promise<string>;
  validateExpression: (expression?: string) => Promise<boolean>;
  // TODO: fix these types
  addCoachMarkRef: any;
  onCopy: any;
  undo: any;
  redo: any;
}
