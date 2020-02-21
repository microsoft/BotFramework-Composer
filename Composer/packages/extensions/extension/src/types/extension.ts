// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, KindSchema, RecognizerSchema } from './uiSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  roleSchema?: RoleSchema;
  kindSchema?: KindSchema;
  recognizers?: RecognizerSchema[];
}
