// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, RecognizerSchema } from './formSchema';
import { FlowEditorConfig } from './flowSchema';

export interface PluginConfig {
  formSchema?: UISchema;
  roleSchema?: RoleSchema;
  recognizers?: RecognizerSchema[];
  visualSchema?: FlowEditorConfig;
}
