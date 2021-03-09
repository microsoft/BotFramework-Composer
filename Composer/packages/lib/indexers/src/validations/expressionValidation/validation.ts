// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable no-bitwise */
import { Expression, ReturnType } from 'adaptive-expressions';
import formatMessage from 'format-message';

const EMPTY = formatMessage(`is missing or empty`);
const RETURNTYPE_NOT_MATCH = formatMessage('the return type does not match');
export const BUILT_IN_FUNCTION_ERROR = 'not a built-in function or a custom function.';

const expressionErrorMessage = (error: string) => formatMessage('must be an expression: {error}', { error });
export const builtInFunctionErrorMessage = (error: string) =>
  formatMessage(`{error} Please add unknown functions to setting's customFunctions field.`, {
    error,
  });

//bitwise operation
export const addReturnType = (currentType: number, newType: number) => {
  return currentType | newType;
};

export const checkStringExpression = (exp: string): number => {
  //StringExpression always assumes string interpolation unless prefixed with =, producing a string
  if (exp.trim().startsWith('=')) {
    return Expression.parse(exp.trim().substring(1)).returnType;
  }

  return ReturnType.String;
};

export const checkExpression = (exp: any, required: boolean): number => {
  if ((exp === undefined || '') && required) {
    throw new Error(EMPTY);
  }

  let returnType = 0;

  switch (typeof exp) {
    case 'object': {
      returnType = ReturnType.Object;
      if (Array.isArray(exp)) {
        returnType = addReturnType(returnType, ReturnType.Array);
      }
      break;
    }
    case 'boolean': {
      returnType = ReturnType.Boolean;
      break;
    }
    case 'number': {
      returnType = ReturnType.Number;
      break;
    }
    case 'string': {
      returnType = checkStringExpression(exp);
      break;
    }
    default:
      break;
  }

  return returnType;
};

//The return type should match the schema type
// the return type use binary number to store
// if returnType = 24, the expression result is 16+8. so the type is string or array
export const checkReturnType = (returnType: number, types: number[]): string => {
  // if return type contain object do nothing.
  if (returnType & ReturnType.Object) return '';

  return types.some((type) => type & returnType) ? '' : RETURNTYPE_NOT_MATCH;
};

//string match or * match
export const checkCustomFunctions = (currentFunction: string, customFunction: string) => {
  //.* or * => #
  let customReg = customFunction.replace(/\.\*|\*/g, '#');
  //. => [.]
  customReg = customReg.replace(/\./g, '[.]');
  //# => .*
  // a.b.* => a[.]b.*
  customReg = customReg.replace(/#/g, '.*');
  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(`^${customReg}$`);
  return reg.test(currentFunction);
};

export const filterCustomFunctionError = (error: string, CustomFunctions: string[]): string => {
  //Now all customFunctions is from lg file content.
  //If the custom functions are defined in runtime, use the field from settings to filter
  if (error.endsWith(BUILT_IN_FUNCTION_ERROR)) {
    const currentFunction = error.split(' ')[0];
    if (CustomFunctions.some((item) => checkCustomFunctions(currentFunction, item))) {
      return '';
    }

    return builtInFunctionErrorMessage(error);
  }

  return expressionErrorMessage(error);
};
