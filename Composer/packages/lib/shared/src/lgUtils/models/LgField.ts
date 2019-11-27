// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgText from '../parsers/parseLgText';
import parseLgTemplateRef from '../parsers/parseLgTemplateRef';

import LgTemplateRef from './LgTemplateRef';

enum LgFieldType {
  Ref = 'LgTemplateRef',
  LgText = 'LgText',
}

export default class LgField {
  private type: LgFieldType;
  content: string | LgTemplateRef;

  private constructor(content: string | LgTemplateRef, type: LgFieldType) {
    this.content = content;
    this.type = type;
  }

  static parse(input: string): LgField {
    const asLgText = parseLgText(input);
    if (asLgText !== null) {
      return new LgField(asLgText, LgFieldType.LgText);
    }

    const asTemplateRef = parseLgTemplateRef(input);
    if (asTemplateRef !== null) {
      return new LgField(asTemplateRef, LgFieldType.Ref);
    }

    return new LgField(input, LgFieldType.LgText);
  }

  static from(lgTemplateRef: LgTemplateRef): LgField | null {
    if (lgTemplateRef) {
      return new LgField(lgTemplateRef, LgFieldType.Ref);
    }
    return null;
  }

  toString(): string {
    if (typeof this.content === 'string') {
      return `- ${this.content}`;
    }

    if (typeof this.content.toString === 'function') {
      return `- ${this.content.toString()}`;
    }

    return '';
  }

  isTemplateRef(): boolean {
    return this.type === LgFieldType.Ref;
  }

  isLgText(): boolean {
    return this.type === LgFieldType.LgText;
  }
}
