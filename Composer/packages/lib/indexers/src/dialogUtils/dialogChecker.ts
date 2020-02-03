// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { ExpressionEngine } from 'botframework-expressions';
import formatMessage from 'format-message';
import { SDKTypes, FieldNames } from '@bfc/shared';

import { Diagnostic } from '../diagnostic';

import { CheckerFunc } from './types';

const ExpressionParser = new ExpressionEngine();

export const createPath = (path: string, type: string): string => {
  const steps = [FieldNames.Events, FieldNames.Actions, FieldNames.ElseActions];
  let list = path.split('.');
  const matches = list.filter(x => !steps.every(step => !x.startsWith(step)));

  const focused = matches.join('.');
  list = path.split(`${focused}.`);
  if (list.length !== 2) return path;

  return `${list[0]}${focused}#${type}#${list[1]}`;
};

export const checkExpression = (exp: string, required: boolean, path: string, type: string): Diagnostic | null => {
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
    diagnostic.path = createPath(path, type);
    return diagnostic;
  }

  return null;
};

function findAllRequiredType(schema: any): { [key: string]: boolean } {
  if (!schema) return {};
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
  if (!schema) return [];
  const diagnostics: Diagnostic[] = [];
  const requiredTypes = findAllRequiredType(schema);
  Object.keys(value).forEach(key => {
    const property = value[key];
    if (Array.isArray(property)) {
      const itemsSchema = get(schema, ['properties', key, 'items'], null);
      if (itemsSchema?.$role === 'expression') {
        property.forEach((child, index) => {
          const diagnostic = checkExpression(child, !!requiredTypes[key], `${path}.${key}[${index}]`, type);
          if (diagnostic) diagnostics.push(diagnostic);
        });
      } else if (itemsSchema?.type === 'object') {
        property.forEach((child, index) => {
          const result = IsExpression(`${path}.${key}[${index}]`, child, type, itemsSchema);
          if (result) diagnostics.splice(0, 0, ...result);
        });
      }
    } else if (get(schema.properties[key], '$role') === 'expression') {
      const diagnostic = checkExpression(property, !!requiredTypes[key], `${path}.${key}`, type);
      if (diagnostic) diagnostics.push(diagnostic);
    }
  });
  return diagnostics;
};

//the type of 'Microsoft.ChoiceInput' has anyof schema in choices
export const checkChoices: CheckerFunc = (path, value, type, schema) => {
  const choices = value.choices;
  if (typeof choices === 'string') {
    const diagnostic = checkExpression(choices, false, `${path}.choices`, type);
    if (diagnostic) return [diagnostic];
  }
  return null;
};

export const checkerFuncs: { [type: string]: CheckerFunc[] } = {
  '.': [IsExpression], //this will check all types
  [SDKTypes.ChoiceInput]: [checkChoices],
};
