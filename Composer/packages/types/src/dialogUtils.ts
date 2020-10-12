// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ISearchTarget = {
  type: string;
  value: string;
};

export type IDefinition = {
  [key: string]: any;
};

export type ISearchResult = {
  [key: string]: string[];
};

export type IExpressionProperties = {
  [key: string]: {
    properties: string[];
    requiredTypes: { [key: string]: boolean };
  };
};

export type IIntentTrigger = {
  intent: string;
  dialogs: string[];
};
