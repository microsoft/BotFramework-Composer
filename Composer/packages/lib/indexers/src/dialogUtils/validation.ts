// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ExpressionEngine, ReturnType } from 'botframework-expressions';
import formatMessage from 'format-message';

import { Diagnostic } from '../diagnostic';

export const ExpressionType = {
  number: 'number',
  integer: 'integer',
  boolean: 'boolean',
  string: 'string',
};

const ExpressionParser = new ExpressionEngine();

const isExpression = (value: string | boolean | number, types: string[]): boolean => {
  if (typeof value === 'string' && value[0] === '=') return true;
  //StringExpression always assumes string interpolation unless prefixed with =, producing a string
  if (types.length === 1 && types[0] === ExpressionType.string) return false;
  return true;
};

//The return type should match the schema type
const checkReturnType = (returnType: ReturnType, types: string[]): string => {
  if (types.indexOf(returnType) > -1) return '';
  if (returnType === ReturnType.Number && types.indexOf(ExpressionType.integer) > -1) {
    return '';
  }
  return formatMessage('the expression type is not match');
};

export const checkExpression = (exp: string | boolean | number, required: boolean, types: string[]): string => {
  let message = '';
  if (!exp && required) {
    message = formatMessage(`is missing or empty`);
  } else {
    try {
      let returnType: ReturnType;
      if (typeof exp === 'boolean') {
        returnType = ReturnType.Boolean;
      } else if (typeof exp === 'number') {
        returnType = ReturnType.Number;
      } else {
        returnType = ExpressionParser.parse(exp).returnType;
      }
      message = checkReturnType(returnType, types);
    } catch (error) {
      message = `${formatMessage('must be an expression:')} ${error})`;
    }
  }

  return message;
};

export const validate = (
  value: string | boolean | number,
  required: boolean,
  path: string,
  types: string[]
): Diagnostic | null => {
  //if there is no type do nothing
  if (types.length === 0) return null;

  if (!isExpression(value, types)) return null;

  //remove '='
  if (typeof value === 'string' && value[0] === '=') {
    value = value.substring(1);
  }

  const message = checkExpression(value, required, types);
  if (!message) return null;

  const diagnostic = new Diagnostic(message, '');
  diagnostic.path = path;
  return diagnostic;
};
