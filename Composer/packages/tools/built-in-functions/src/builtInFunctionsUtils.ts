// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { buildInFunctionsMap } from './builtInFunctionsMap';

const removeParamFormat = (params: string): string => {
  const resultArr = params.split(',').map((element) => {
    return element.trim().split(/\??:/)[0];
  });
  return resultArr.map((a) => a.trim()).join(', ');
};

export const getBuiltInFunctionInsertText = (builtInFunctionKey: string): string => {
  const builtInFunction = buildInFunctionsMap.get(builtInFunctionKey);

  if (builtInFunction) {
    return `${builtInFunctionKey}(${removeParamFormat(builtInFunction.Params.toString())})`;
  }
  return '';
};
