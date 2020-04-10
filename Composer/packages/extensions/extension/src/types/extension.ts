// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema, RoleSchema, RecognizerSchema } from './uiSchema';
import { VisualSchema } from './visualSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  visualSchema?: VisualSchema;
  roleSchema?: RoleSchema;
  recognizers?: RecognizerSchema[];
}
