// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { ExpressionEngine } from 'botbuilder-expression-parser';

import { Diagnostic } from '../diagnostic';

import { CheckerFunc } from './types';

const ExpressionParser = new ExpressionEngine();

export const IsExpression: CheckerFunc = (
  path,
  value,
  optional: { properties: string[]; requiredTypes: { [key: string]: boolean } }
) => {
  let message = '';
  const { properties, requiredTypes } = optional;
  return properties.reduce((result: Diagnostic[], property) => {
    const exp = get(value, property);
    if (!exp && requiredTypes[property]) {
      message = `is missing or empty`;
    } else {
      try {
        ExpressionParser.parse(exp);
      } catch (error) {
        message = `must be an expression`;
      }
    }
    if (message) {
      const diagnostic = new Diagnostic(message, '');
      diagnostic.path = `${path}: ${value.$type}: ${property}`;
      result.push(diagnostic);
    }
    return result;
  }, []);
  return null;
};
