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

export const evaluateWidgetExpression = (input: string, context: any): any => {
  if (typeof input !== 'string') return input;

  if (input.startsWith('=')) {
    return evaluateAsValueExpression(input, context);
  }
  return input;
};
