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

export interface LuParsed {
  intents: LuIntentSection[];
  diagnostics: Diagnostic[];
}

export enum LuSectionTypes {
  SIMPLEINTENTSECTION = 'simpleIntentSection',
  NESTEDINTENTSECTION = 'nestedIntentSection',
}

export interface LuEntity {
  Name: string;
}

export interface LuIntentSection {
  Name: string;
  Body: string;
  Entities?: LuEntity[];
  Children?: LuIntentSection[];
}

export interface LuFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: Diagnostic[];
  intents: LuIntentSection[];
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

export type MemoryResolver = (id: string) => string[] | undefined;
