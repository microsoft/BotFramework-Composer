// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgTemplateRef from '../parsers/parseLgTemplateRef';

import { LgTemplateName, LgTemplateRefString } from './stringTypes';

export default class LgTemplateRef {
  name: LgTemplateName;

  parameters: string[];

  constructor(name: LgTemplateName, parameters: string[] = []) {
    this.name = name;
    this.parameters = parameters;
  }

  static parse(input: LgTemplateRefString): LgTemplateRef | null {
    return parseLgTemplateRef(input);
  }

  toString(): LgTemplateRefString {
    const paramsSuffix = Array.isArray(this.parameters) ? `(${this.parameters.join(',')})` : '()';
    return `[${this.name}${paramsSuffix}]`;
  }
}
