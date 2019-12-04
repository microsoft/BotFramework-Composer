// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic } from './diagnostic';

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
  diagnostics: Diagnostic[];
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

export interface LgTemplate {
  name: string;
  body: string;
  parameters: string[];
}

export interface LgFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: Diagnostic[];
  templates: LgTemplate[];
}
