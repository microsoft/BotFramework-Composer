// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates } from 'botbuilder-lg';
import { ValueExpression } from 'adaptive-expressions';

const evaluateAsLGTemplate = (propValue: string, scope: any) => {
  const templateId = 'widgetProp';
  const lgContent = `# ${templateId}\r\n- ${propValue}`;
  try {
    const lgResult = Templates.parseText(lgContent).evaluate(templateId, scope);
    return lgResult ?? propValue;
  } catch (err) {
    return propValue;
  }
};

const evaluateAsValueExpression = (propValue: string, scope: any): any => {
  try {
    const expResult = new ValueExpression(propValue).tryGetValue(scope);
    return expResult.value;
  } catch (err) {
    return propValue;
  }
};

const StringInterpolationPattern = new RegExp(/\$\{.+\}/);

export const ActionContextKey = 'action';

export const evaluateWidgetProp = (input: string, context: any, requiredContextKey = ''): any => {
  if (typeof input !== 'string') return input;

  if (input.startsWith('=') && input.indexOf(requiredContextKey) > -1) {
    return evaluateAsValueExpression(input, context);
  }

  if (StringInterpolationPattern.test(input)) {
    return evaluateAsLGTemplate(input, context);
  }
  return input;
};
