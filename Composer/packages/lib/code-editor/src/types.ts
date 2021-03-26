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
    onNavigateToLgPage?: (
      lgFileId: string,
      options?: { templateId: string | undefined; line: number | undefined }
    ) => void;
    languageServer?:
      | {
          host?: string;
          hostname?: string;
          port?: number | string;
          path: string;
        }
      | string;
  };
