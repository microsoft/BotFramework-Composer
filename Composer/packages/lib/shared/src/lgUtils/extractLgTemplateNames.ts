// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRefPattern } from './parsers/patterns';
import { LgTemplateName } from './models/stringTypes';

/**
 *
 * @param text string
 * -[Greeting], I'm a fancy bot, [Bye] ---> ['Greeting', 'Bye']
 *
 */
export default function extractLgTemplateNames(text: string): LgTemplateName[] {
  const templateNames: string[] = [];

  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(LgTemplateRefPattern, 'g');

  let matchResult;
  while ((matchResult = reg.exec(text)) !== null) {
    const templateName = matchResult[1];
    templateNames.push(templateName);
  }
  return templateNames;
}
