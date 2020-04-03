// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

export interface IIntentTrigger {
  intent: string;
  dialogs: string[];
}
