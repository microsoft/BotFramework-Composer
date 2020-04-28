// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import buildLuType from '../stringBuilders/buildLuType';

export default class LuType {
  hostKind: string;
  type: string;
  constructor($kind: string, type = 'response') {
    this.hostKind = $kind;
    this.type = type;
  }

  /** No parse() method since LgType cannot recover hostKind */
  // static parse() {}

  /**
   * @returns lgType string used in LgMetaData
   */
  toString(): string {
    return buildLuType(this);
  }
}
