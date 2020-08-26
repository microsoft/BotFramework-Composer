// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates } from 'botbuilder-lg';

const LgStringRegex = new RegExp(/\$\{.+\}/);
export const widgetPropNeedsEvaluation = (widgetProp: string): boolean => {
  if (typeof widgetProp !== 'string') return false;
  return LgStringRegex.test(widgetProp);
};

export const evaluateAsLG = (propValue: string, scope: any) => {
  const templateId = 'widgetProp';
  const lgContent = `# ${templateId}\r\n- ${propValue}`;
  const lgResult = Templates.parseText(lgContent).evaluate(templateId, scope);
  return lgResult;
};
