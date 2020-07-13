// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RoleSchema, RecognizerSchema, UIOptions, FormUISchema } from './formSchema';
import { FlowEditorConfig } from './flowSchema';

export interface PluginConfig {
  formSchema?: FormUISchema;
  roleSchema?: RoleSchema;
  recognizers?: RecognizerSchema[];
  visualSchema?: FlowEditorConfig;
}
