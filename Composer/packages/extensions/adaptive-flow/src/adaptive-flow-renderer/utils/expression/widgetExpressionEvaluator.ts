// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ValueExpression } from 'adaptive-expressions';

const evaluateAsValueExpression = (propValue: string, scope: any): any => {
  try {
    const expResult = new ValueExpression(propValue).tryGetValue(scope);
    return expResult.value;
  } catch (err) {
    return propValue;
  }
};

export const ActionContextKey = 'action';

export const evaluateWidgetExpression = (input: string, context: any, requiredContextKey = ''): any => {
  if (typeof input !== 'string') return input;

  if (input.startsWith('=') && input.indexOf(requiredContextKey) > -1) {
    return evaluateAsValueExpression(input, context);
  }
  return input;
};
