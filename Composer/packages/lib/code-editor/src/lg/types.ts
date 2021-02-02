// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';

export type TemplateRefPayload = {
  kind: 'templateRef';
  data: { templates: readonly LgTemplate[]; onSelectTemplate: (templateString: string) => void };
};

export type PropertyItem = {
  id: string;
  children: PropertyItem[];
};

export type PropertyRefPayload = {
  kind: 'propertyRef';
  data: { properties: readonly string[]; onSelectProperty: (property: string) => void };
};

export type FunctionRefPayload = {
  kind: 'functionRef';
  data: {
    functions: readonly { key: string; name: string; children: string[] }[];
    onSelectFunction: (functionString: string) => void;
  };
};

export type ToolbarButtonPayload = TemplateRefPayload | PropertyRefPayload | FunctionRefPayload;

export type LgLanguageContext =
  | 'expression'
  | 'singleQuote'
  | 'doubleQuote'
  | 'comment'
  | 'templateBody'
  | 'templateName'
  | 'root';
