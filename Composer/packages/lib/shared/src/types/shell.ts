// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialogInfo, LuFile, LgFile, LuIntentSection, LgTemplate } from './indexers';

export interface EditorSchema {
  content?: {
    fieldTemplateOverrides: any;
    SDKOverrides?: any;
  };
}

export interface BotSchemas {
  sdk?: any;
  diagnostics?: any[];
}

export interface ShellData {
  locale: string;
  botName: string;
  currentDialog: DialogInfo;
  projectId: string;
  data: {
    $type: string;
    [key: string]: any;
  };
  designerId: string;
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
  // TODO: remove
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
  lgFileResolver: (id: string) => Promise<any>;
  luFileResolver: (id: string) => Promise<any>;
  getLgTemplates: (id: string) => Promise<LgTemplate[]>;
  copyLgTemplate: (id: string, fromTemplateName: string, toTemplateName?: string) => Promise<string>;
  createLgTemplate: (id: string, template: Partial<LgTemplate>, position: number) => Promise<void>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<void>;
  removeLgTemplate: (id: string, templateName: string) => Promise<void>;
  removeLgTemplates: (id: string, templateNames: string[]) => Promise<void>;
  addLuIntent: (id: string, intent: LuIntentSection | null) => Promise<void>;
  updateLuIntent: (id: string, intentName: string, intent: LuIntentSection | null) => Promise<void>;
  updateRegExIntent: (id: string, intentName: string, pattern: string) => Promise<void>;
  removeLuIntent: (id: string, intentName: string) => Promise<void>;
  createDialog: (actions: any) => Promise<string>;
  validateExpression: (expression?: string) => Promise<boolean>;
  // TODO: fix these types
  addCoachMarkRef: any;
  onCopy: any;
  undo: any;
  redo: any;
}
