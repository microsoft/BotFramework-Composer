// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, RecognizerSchema } from './uiSchema';
import { VisualEditorConfig } from './visualSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  roleSchema?: RoleSchema;
  recognizers?: RecognizerSchema[];
  visual?: VisualEditorConfig;
}
