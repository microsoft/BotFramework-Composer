// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Expression, ReturnType } from 'adaptive-expressions';
import formatMessage from 'format-message';
import { Diagnostic } from '@bfc/shared';
import startsWith from 'lodash/startsWith';

import { ExpressionType, ExpressionProperty } from './types';

const customFunctionErrorMessage = (func: string) =>
  formatMessage(`Error: {func} does not have an evaluator, it's not a built-in function or a custom function`, {
    func,
  });

const ExpressionTypeMapString = {
  [ReturnType.Number]: 'number',
  [ReturnType.String]: 'string',
  [ReturnType.Boolean]: 'boolean',
  [ReturnType.Object]: 'object',
  [ReturnType.Array]: 'array',
};

const isExpression = (value: string | boolean | number, types: string[]): boolean => {
  //StringExpression always assumes string interpolation unless prefixed with =, producing a string
  return (typeof value === 'string' && value[0] === '=') || types.length !== 1 || types[0] !== ExpressionType.string;
};

//The return type should match the schema type
//TODO: returnType is number, schem type is string, need map or unify
const checkReturnType = (returnType: ReturnType, types: string[]): string => {
  return returnType === ReturnType.Object ||
    types.includes(ExpressionTypeMapString[returnType]) ||
    (returnType === ReturnType.Number && types.includes(ExpressionType.integer))
    ? ''
    : formatMessage('the return type does not match');
};

export const checkExpression = (
  exp: string | boolean | number,
  required: boolean,
  types: string[],
  customFunctions: string[]
): string => {
  let message = '';
  let returnType: ReturnType = ReturnType.Object;
  switch (typeof exp) {
    case 'boolean': {
      returnType = ReturnType.Boolean;
      break;
    }
    case 'number': {
      returnType = ReturnType.Number;
      break;
    }
    default: {
      if (!exp && required) message = formatMessage(`is missing or empty`);
      try {
        returnType = Expression.parse(exp).returnType;
      } catch (error) {
        if (
          customFunctions.length &&
          customFunctions.some((item) => startsWith(error, customFunctionErrorMessage(item)))
        ) {
          message = '';
        } else {
          message = `${formatMessage('must be an expression:')} ${error})`;
        }
      }
    }
  }
  if (!message) message = checkReturnType(returnType, types);
  return message;
};

export const validate = (expression: ExpressionProperty, customFunctions: string[]): Diagnostic | null => {
  const { required, path, types } = expression;
  let value = expression.value;
  //if there is no type do nothing
  //if the json type length more than 2, the type assumes string interpolation
  if (!types.length || types.length > 2 || !isExpression(value, types)) {
    return null;
  }

  //remove '='
  if (typeof value === 'string' && value[0] === '=') {
    value = value.substring(1);
  }

  const message = checkExpression(value, required, types, customFunctions);
  if (!message) return null;

  const diagnostic = new Diagnostic(message, '');
  diagnostic.path = path;
  return diagnostic;
};
