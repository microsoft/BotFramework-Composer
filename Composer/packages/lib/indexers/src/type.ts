// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic as LGDiagnostic } from 'botbuilder-lg';

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
  content: any;
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
