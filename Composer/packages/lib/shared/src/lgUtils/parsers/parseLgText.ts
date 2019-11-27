// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgText } from '../models/stringTypes';
import { LgTextPattern } from '../lgPatterns';

export default function parseLgText(inputString: LgText): string | null {
  if (typeof inputString !== 'string') return null;

  const results = inputString.match(LgTextPattern);
  if (Array.isArray(results) && results.length === 2) {
    return results[1];
  }
  return null;
}
