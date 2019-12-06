// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic } from '../diagnostic';

export interface ISearchTarget {
  type: string;
  value: string;
}

export interface IDefinition {
  [key: string]: any;
}

export interface ISearchResult {
  [key: string]: string[];
}

export interface IExpressionProperties {
  [key: string]: {
    properties: string[];
    requiredTypes: { [key: string]: boolean };
  };
}

export type CheckerFunc = (path: string, value: any, optional?: any) => Diagnostic[] | null; // error msg
