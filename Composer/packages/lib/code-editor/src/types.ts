// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CodeEditorSettings, LgTemplate, TelemetryClient } from '@bfc/shared';

import { BaseEditorProps } from './BaseEditor';
import { LGOption } from './utils/types';

/**
 * Common props for both LG code and response editors.
 */
type LgCommonEditorProps = {
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  lgOption?: LGOption;
  telemetryClient: TelemetryClient;
};

/**
 * LG Response editor props;
 */
export type LgResponseEditorProps = LgCommonEditorProps & {
  onRemoveTemplate: (templateId: string) => void;
  onTemplateChange: (templateId: string, body?: string) => void;
  editorSettings?: Partial<CodeEditorSettings>;
};

/**
 * LG code editor props.
 */
export type LgCodeEditorProps = LgCommonEditorProps &
  BaseEditorProps & {
    popExpandOptions?: { onEditorPopToggle?: (expanded: boolean) => void; popExpandTitle: string };
    toolbarHidden?: boolean;
    showDirectTemplateLink?: boolean;
    onNavigateToLgPage?: (lgFileId: string, options?: { templateId?: string; line?: number }) => void;
    languageServer?:
      | {
          host?: string;
          hostname?: string;
          port?: number | string;
          path: string;
        }
      | string;
  };

export type PropertyItem = {
  id: string;
  name: string;
  children: PropertyItem[];
};

export type TemplateRefPayload = {
  kind: 'template';
  data: {
    templates: readonly LgTemplate[];
    onSelectTemplate: (templateString: string, itemType: 'template') => void;
  };
};

export type PropertyRefPayload = {
  kind: 'property';
  data: { properties: readonly string[]; onSelectProperty: (property: string, itemType: 'property') => void };
};

export type FunctionRefPayload = {
  kind: 'function';
  data: {
    functions: readonly { key: string; name: string; children: string[] }[];
    onSelectFunction: (functionString: string, itemType: 'function') => void;
  };
};

export type ToolbarButtonPayload = TemplateRefPayload | PropertyRefPayload | FunctionRefPayload;
