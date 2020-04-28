// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgTemplateRef from '../parsers/parseLgTemplateRef';
import buildLgTemplateRefString from '../stringBuilders/buildLgTemplateRefString';

import { LgTemplateName, LgTemplateRefString } from './stringTypes';

export default class LgTemplateRef {
  name: LgTemplateName;

  parameters: string[];

  constructor(name: LgTemplateName, parameters: string[] = []) {
    this.name = name;
    this.parameters = parameters;
  }

  static parse(input?: LgTemplateRefString): LgTemplateRef | null {
    if (!input) return null;
    return parseLgTemplateRef(input);
  }

  toString(): LgTemplateRefString {
    return buildLgTemplateRefString(this);
  }
}
