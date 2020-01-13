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

export interface ILUISJsonStructure {
  intents: Intent[];
  utterances: Utterance[];
}

export interface IParsedObject {
  LUISJsonStructure: ILUISJsonStructure;
}

export interface LuFile {
  id: string;
  relativePath: string;
  content: string;
  parsedContent?: IParsedObject;
  diagnostics: Diagnostic[];
  [key: string]: any;
}
export interface CodeRange {
  startLineNumber: number;
  endLineNumber: number;
}

export interface LgTemplate {
  name: string;
  body: string;
  parameters: string[];
  range?: CodeRange;
}

export interface LgFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: Diagnostic[];
  templates: LgTemplate[];
}

export type FileResolver = (id: string) => FileInfo | undefined;
