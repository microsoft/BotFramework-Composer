// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateRefString } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';

import { LgTemplateRefPattern } from './patterns';
import parseLgParamString from './parseLgParamString';

export default function parseLgTemplateRef(inputString: LgTemplateRefString): LgTemplateRef | null {
  if (!inputString) return null;

  const results = LgTemplateRefPattern.match(inputString);
  if (Array.isArray(results) && results.length === 5) {
    const name = results[1];
    const lgParams = parseLgParamString(results[4]);

    return new LgTemplateRef(name, lgParams);
  }
  return null;
}
