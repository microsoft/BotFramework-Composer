/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
  Name: string;
  Body: string;
  Parameters: string[];
  Range: CodeRange;
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
  focusedSteps: string[];
  focusedTab?: string;
  focusPath: string;
  hosted: boolean;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  schemas: BotSchemas;
}

export interface ShellApi {
  getState: <T = any>() => Promise<T>;
  getDialogs: <T = any>() => Promise<T>;
  saveData: <T = any>(newData: T, updatePath: string) => Promise<void>;
  navTo: (path: string) => Promise<void>;
  onFocusSteps: (stepIds: string[], focusedTab?: string) => Promise<void>;
  onFocusEvent: (eventId: string) => Promise<void>;
  createLuFile: (id: string) => Promise<void>;
  updateLuFile: (id: string, content: string) => Promise<void>;
  updateLgFile: (id: string, content: string) => Promise<void>;
  getLgTemplates: (id: string) => Promise<LgTemplate[]>;
  createLgTemplate: (id: string, template: LgTemplate, position: number) => Promise<void>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<void>;
  removeLgTemplate: (id: string, templateName: string) => Promise<void>;
  createDialog: () => Promise<string>;
  validateExpression: (expression?: string) => Promise<boolean>;
}
