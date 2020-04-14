// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, RecognizerSchema } from './uiSchema';
import { FlowEditorConfig } from './flowSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  roleSchema?: RoleSchema;
  recognizers?: RecognizerSchema[];
  visual?: FlowEditorConfig;
}
