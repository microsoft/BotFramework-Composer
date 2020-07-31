// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { buildInfunctionsMap } from '@bfc/lg-languageserver';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

export const expressionsResolver = (): CompletionItem[] => {
  return Array.from(buildInfunctionsMap).map((item) => {
    const [key, value] = item;
    return {
      label: key,
      kind: CompletionItemKind.Function,
      insertText: `${key}(${removeParamFormat(value.Params.toString())})`,
      documentation: value.Introduction,
    };
  });
};

const removeParamFormat = (params: string): string => {
  const resultArr = params.split(',').map((element) => {
    return element.trim().split(':')[0];
  });
  return resultArr.join(' ,');
};
