// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates } from 'botbuilder-lg';
import { ExpressionParser } from 'adaptive-expressions';

// Capture patterns that are strictly '${EXPRESSION}'
//   - '${action.condition}'
//   - '${if(action.value, concat(action.value, "(Event)"))}'
const ValueAccessPattern = new RegExp(/^\$\{([^}]+)\}$/);

// Catpure patterns that include '...${...}...'
const StringTemplatePattern = new RegExp(/\$\{.+\}/);

export const evaluateWidgetExpression = (input: string, context: any): string => {
  if (typeof input !== 'string') return input;

  if (ValueAccessPattern.test(input)) {
    const matchResult = ValueAccessPattern.exec(input);
    const expString = matchResult ? matchResult[1] : '';
    return evaluateAsExpression(expString, context);
  }

  if (StringTemplatePattern.test(input)) {
    return evaluateAsLGTemplate(input, context);
  }

  return input;
};

export type WidgetPropEvaluator = (propValue: string, scope: any) => string;

export const evaluateAsLGTemplate: WidgetPropEvaluator = (propValue, scope) => {
  const templateId = 'widgetProp';
  const lgContent = `# ${templateId}\r\n- ${propValue}`;
  const lgResult = Templates.parseText(lgContent).evaluate(templateId, scope);
  return lgResult;
};

const expressionParser = new ExpressionParser();
export const evaluateAsExpression: WidgetPropEvaluator = (propValue, scope) => {
  const exp = expressionParser.parse(propValue);
  const expResult = exp.tryEvaluate(scope);
  return expResult.value;
};
