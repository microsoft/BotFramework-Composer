// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { buildInFunctionsMap, getBuiltInFunctionInsertText } from '@bfc/built-in-functions';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

export const expressionsResolver = (): CompletionItem[] => {
  return Array.from(buildInFunctionsMap).map((item) => {
    const [key, value] = item;
    return {
      label: key,
      kind: CompletionItemKind.Function,
      insertText: getBuiltInFunctionInsertText(key),
      documentation: value.Introduction,
    };
  });
};
