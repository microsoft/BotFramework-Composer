// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgText } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';

import { LgTextPattern } from './patterns';
import parseLgParamString from './parseLgParamString';

export default function parseLgText(inputString: LgText): LgTemplateRef | null {
  if (!inputString) return null;

  const results = LgTextPattern.match(inputString);
  if (Array.isArray(results) && results.length === 5) {
    const name = results[1];
    const lgParams = parseLgParamString(results[4]);

    return new LgTemplateRef(name, lgParams);
  }
  return null;
}
