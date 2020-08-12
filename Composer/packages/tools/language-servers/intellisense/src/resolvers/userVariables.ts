// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CompletionItemKind } from 'vscode-languageserver';

export const userVariablesResolver = (memoryVariables: string[]) => {
  return memoryVariables.map((variable) => ({
    label: variable,
    kind: CompletionItemKind.Variable,
    insertText: variable,
    documentation: '',
  }));
};
