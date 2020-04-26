// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import buildLgType from '../stringBuilders/buildLgType';

export default class LgType {
  hostKind: string;
  hostField: string;
  constructor($kind: string, hostField: string) {
    this.hostKind = $kind;
    this.hostField = hostField;
  }

  /** No parse() method since LgType cannot recover hostKind */
  // static parse() {}

  /**
   * @returns lgType string used in LgMetaData
   */
  toString(): string {
    return buildLgType(this);
  }
}
