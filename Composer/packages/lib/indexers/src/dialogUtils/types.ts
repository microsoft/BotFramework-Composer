// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import keys from 'lodash/keys';

import { Diagnostic } from '../diagnostic';

import { IsExpression } from './dialogChecker';

export interface ISearchTarget {
  type: string;
  value: string;
}

export interface IDefinitions {
  [key: string]: any;
}

export interface ISearchResult {
  [key: string]: string[];
}

export interface CheckerFunc {
  (node: { path: string; value: any }): Diagnostic | null; // error msg
}

export class ValidateFields {
  constructor(expressions: ISearchResult) {
    this.expressions = expressions;
  }

  public expressions: ISearchResult;

  getDialogChecker(): { [key: string]: CheckerFunc[] } {
    const result = {};
    keys(this.expressions).map((key: string) => {
      const temp = this.expressions[key].map((property: string) => {
        return IsExpression(property);
      });
      if (result[key]) {
        result[key] = { ...result[key], ...temp };
      } else {
        result[key] = temp;
      }
    });
    return result;
  }
}
