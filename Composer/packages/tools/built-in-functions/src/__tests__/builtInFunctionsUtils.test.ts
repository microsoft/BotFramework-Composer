// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { builtInFunctionsGrouping } from '../builtInFunctionsGrouping';
import { getBuiltInFunctionInsertText } from '../builtInFunctionsUtils';

// List of all built in functions
const builtInFunctionNames = builtInFunctionsGrouping.reduce((acc, item) => {
  acc.push(...item.children);
  return acc;
}, []);

describe('Built-in functions', () => {
  test.each(builtInFunctionNames)('given %p as function name, returns function call insert text', (functionName) => {
    const result = getBuiltInFunctionInsertText(functionName);
    // Expect it to have a string value that is not empty
    expect(!!result).toBeTruthy();
  });
});
