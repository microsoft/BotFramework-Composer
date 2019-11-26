// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { LgTemplateName, LgTemplateRefString, LgText } from './stringTypes';

export default class LgTemplateRef {
  name: LgTemplateName;

  parameters: string[] | undefined;

  constructor(name: LgTemplateName, parameters?: string[]) {
    this.name = name;
    this.parameters = parameters;
  }

  toString(): LgTemplateRefString {
    const paramsSuffix = Array.isArray(this.parameters) ? `(${this.parameters.join(',')})` : '';
    return `[${this.name}${paramsSuffix}]`;
  }

  toLgText(): LgText {
    return `- ${this.toString()}`;
  }
}
