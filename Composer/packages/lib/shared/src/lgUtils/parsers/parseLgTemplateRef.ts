// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRefString } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';

import { LgTemplateRefPattern } from './lgPatterns';
import parseLgParamString from './parseLgParamString';

const BoundariedLgTemplateRefPattern = `^${LgTemplateRefPattern}$`;

export default function parseLgTemplateRef(inputString: LgTemplateRefString): LgTemplateRef | null {
  if (typeof inputString !== 'string') return null;

  const results = inputString.match(BoundariedLgTemplateRefPattern);
  if (Array.isArray(results) && results.length === 3) {
    const name = results[1];
    const lgParams = parseLgParamString(results[2]);

    return new LgTemplateRef(name, lgParams);
  }
  return null;
}

/**
 *
 * @param text string
 * -[Greeting], I'm a fancy bot, [Bye] ---> ['Greeting', 'Bye']
 *
 */
export function extractLgTemplateRefs(text: string): LgTemplateRef[] {
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
