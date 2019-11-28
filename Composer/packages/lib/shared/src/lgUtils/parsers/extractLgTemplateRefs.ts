// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import LgTemplateRef from '../models/LgTemplateRef';

import { LgTemplateRefPattern } from './lgPatterns';
import parseLgParamString from './parseLgParamString';

/**
 *
 * @param text string
 * -[Greeting], I'm a fancy bot, [Bye] ---> ['Greeting', 'Bye']
 *
 */
export default function extractLgTemplateRefs(text: string): LgTemplateRef[] {
  const templateRefs: LgTemplateRef[] = [];

  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(LgTemplateRefPattern, 'g');

  let matchResult;
  while ((matchResult = reg.exec(text)) !== null) {
    if (Array.isArray(matchResult) && matchResult.length === 3) {
      const name = matchResult[1];
      const paramString = matchResult[2];

      const parameters = parseLgParamString(paramString);
      templateRefs.push(new LgTemplateRef(name, parameters));
    }
  }
  return templateRefs;
}
