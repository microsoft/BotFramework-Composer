// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import LgTemplateRef from '../models/LgTemplateRef';
import { LgTemplateRefString } from '../models/stringTypes';

import buildLgParamString from './buildLgParamString';

/**
 * { name: 'greeting', parameters: ['1'] } => '@{greeting(1)}'
 */
export default function buildLgTemplateRefString(lgTemplateRef: LgTemplateRef): LgTemplateRefString {
  const { name, parameters } = lgTemplateRef;
  return `\${${name}${buildLgParamString(parameters)}}`;
}
