// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { ExpressionEngine } from 'botframework-expressions';
import formatMessage from 'format-message';

import { Diagnostic } from '../diagnostic';

import { CheckerFunc } from './types';

const ExpressionParser = new ExpressionEngine();

export const checkExpression = (exp: string, required: boolean, path: string): Diagnostic | null => {
  let message = '';
  if (!exp && required) {
    message = formatMessage(`is missing or empty`);
  } else {
    try {
      ExpressionParser.parse(exp);
    } catch (error) {
      message = `${formatMessage('must be an expression:')} ${error})`;
    }
  }
  if (message) {
    const diagnostic = new Diagnostic(message, '');
    diagnostic.path = path;
    return diagnostic;
  }

  return null;
};

function findAllRequiredType(schema: any): { [key: string]: boolean } {
  const types = schema.anyOf?.filter(x => x.title === 'Type');
  const required = {};
  if (types && types.length) {
    types[0].required.forEach((element: string) => {
      required[element] = true;
    });
  }

  if (schema.required) {
    schema.required.forEach((element: string) => {
      required[element] = true;
    });
  }
  return required;
}

export const IsExpression: CheckerFunc = (path, value, type, schema) => {
  const diagnostics: Diagnostic[] = [];
  const requiredTypes = findAllRequiredType(schema);
  Object.keys(value).forEach(key => {
    const property = value[key];
    if (Array.isArray(property)) {
      const itemsSchema = schema.properties[key].items;
      if (itemsSchema?.$role === 'expression') {
        property.forEach((child, index) => {
          const diagnostic = checkExpression(child, !!requiredTypes[key], `${path}#${type}#${key}[${index}]`);
          if (diagnostic) diagnostics.push(diagnostic);
        });
      } else if (itemsSchema?.type === 'object') {
        property.forEach((child, index) => {
          const result = IsExpression(`${path}.${key}[${index}]`, child, type, itemsSchema);
          if (result) diagnostics.splice(0, 0, ...result);
        });
      }
    } else if (get(schema.properties[key], '$role') === 'expression') {
      const diagnostic = checkExpression(property, !!requiredTypes[key], `${path}#${type}#${key}`);
      if (diagnostic) diagnostics.push(diagnostic);
    }
  });
  return diagnostics;
};

//the type of 'Microsoft.ChoiceInput' has anyof schema in choices
export const checkChoices: CheckerFunc = (path, value, type, schema) => {
  if (type === 'Microsoft.ChoiceInput') {
    const choices = value.choices;
    if (typeof choices === 'string') {
      const diagnostic = checkExpression(choices, false, `${path}#${type}#choices`);
      if (diagnostic) return [diagnostic];
    }
  }
  return null;
};

export const checkerFuncs: CheckerFunc[] = [IsExpression, checkChoices];
