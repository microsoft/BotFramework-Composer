// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRefString } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';

import { LgTemplateRefPattern } from './lgPatterns';
import parseLgParamString from './parseLgParamString';

const mapMatchResultToTemplateRef = (matchResult: RegExpMatchArray): LgTemplateRef | null => {
  if (matchResult.length !== 3) {
    return null;
  }

  const name = matchResult[1];
  const lgParams = parseLgParamString(matchResult[2]);

  return new LgTemplateRef(name, lgParams);
};

/**
 * '@{greetings()}' => { name: greetings, parameters: []}
 * 'hi @{greetings()}' => null
 */
export default function parseLgTemplateRef(inputString: LgTemplateRefString): LgTemplateRef | null {
  if (typeof inputString !== 'string') return null;

  const BoundariedLgTemplateRefPattern = `^${LgTemplateRefPattern}$`;
  const matchResult = inputString.match(BoundariedLgTemplateRefPattern);
  if (!matchResult) return null;

  return mapMatchResultToTemplateRef(matchResult);
}

/**
 *
 * @param text string
 * '-@{Greeting()}, I'm a fancy bot, @{Bye()}' => [ LgTemplateRef('Greeting'), LgTemplateRef('Bye') ]
 */
export function extractLgTemplateRefs(text: string): LgTemplateRef[] {
  const templateRefs: LgTemplateRef[] = [];

  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(LgTemplateRefPattern, 'g');

  let matchResult;
  while ((matchResult = reg.exec(text)) !== null) {
    const ref = mapMatchResultToTemplateRef(matchResult);
    if (!ref) continue;

    templateRefs.push(ref);
  }
  return templateRefs;
}
