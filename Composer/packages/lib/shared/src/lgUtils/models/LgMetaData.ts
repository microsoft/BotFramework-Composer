// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import parseLgTemplateName from '../parsers/parseLgTemplateName';

import { LgTemplateName } from './stringTypes';

/**
 * LgMetaData can be converted from & to Lg name. Such as 'bfdactivity-1234'.
 * It's created by Composer, contains designerId and filed type.
 */
export default class LgMetaData {
  type: string;
  designerId: string;

  constructor(lgType: string, designerId: string) {
    this.type = lgType;
    this.designerId = designerId;
  }

  static parse(lgTemplateName: LgTemplateName): LgMetaData | null {
    return parseLgTemplateName(lgTemplateName);
  }

  toString(): LgTemplateName {
    return `bfd${this.type}-${this.designerId}`;
  }
}
