// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRefString } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';
import { LgTemplateRefPattern } from '../lgPatterns';

import parseLgParamString from './parseLgParamString';

export default function parseLgTemplateRef(inputString: LgTemplateRefString): LgTemplateRef | null {
  if (typeof inputString !== 'string') return null;

  const results = inputString.match(LgTemplateRefPattern);
  if (Array.isArray(results) && results.length === 3) {
    const name = results[1];
    const lgParams = parseLgParamString(results[2]);

    return new LgTemplateRef(name, lgParams);
  }
  return null;
}
