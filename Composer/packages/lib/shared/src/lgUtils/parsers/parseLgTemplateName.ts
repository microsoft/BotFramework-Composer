// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateName } from '../models/stringTypes';
import LgMetaData from '../models/LgMetaData';

import { LgNamePattern } from './lgPatterns';

export default function parseLgTemplateName(lgTemplateName: LgTemplateName): LgMetaData | null {
  if (!lgTemplateName) return null;

  const results = lgTemplateName.match(LgNamePattern);
  if (Array.isArray(results) && results.length === 3) {
    return new LgMetaData(results[1], results[2]);
  }
  return null;
}
