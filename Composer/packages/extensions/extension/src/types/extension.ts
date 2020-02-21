// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, KindSchema } from './uiSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  roleSchema?: RoleSchema;
  kindSchema?: KindSchema;
}
