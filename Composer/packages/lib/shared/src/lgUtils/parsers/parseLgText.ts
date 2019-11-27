// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgText } from '../models/stringTypes';
import LgTemplateRef from '../models/LgTemplateRef';
import { LgTextPattern } from '../lgPatterns';

export default function parseLgText(inputString: LgText): LgTemplateRef | null {
  if (!inputString) return null;

  const results = inputString.match(LgTextPattern);
  if (Array.isArray(results) && results.length === 2) {
    const lgTemplateRefString = results[1];
    return LgTemplateRef.parse(lgTemplateRefString);
  }
  return null;
}
