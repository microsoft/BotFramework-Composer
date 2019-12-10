// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import formatMessage from 'format-message';

import { Diagnostic } from '../diagnostic';

import { CheckerFunc } from './types';

const ExpressionParser = new ExpressionEngine();

export const IsExpression: CheckerFunc = (
  path,
  value,
  optional: { properties: string[]; requiredTypes: { [key: string]: boolean } }
) => {
  const { properties, requiredTypes } = optional;
  return properties.reduce((result: Diagnostic[], property) => {
    let message = '';
    const exp = get(value, property);
    if (!exp && requiredTypes[property]) {
      message = formatMessage(`is missing or empty`);
    } else {
      try {
        ExpressionParser.parse(exp);
      } catch (error) {
        message = formatMessage(`must be an expression`);
      }
    }
    if (message) {
      const diagnostic = new Diagnostic(message, '');
      diagnostic.path = `${path}#${value.$type}#${property}`;
      result.push(diagnostic);
    }
    return result;
  }, []);
  return null;
};
