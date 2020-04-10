// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, VisualEditorConfig } from '@bfc/extension';

import { defaultVisualSchema } from '../schema/defaultVisualSchema';
import { defaultVisualWidgets } from '../schema/defaultVisualWidgets';

export const mergePluginConfig = (...plugins: PluginConfig[]): Required<VisualEditorConfig> => {
  const externalWidgets = plugins.map(x => x.visual?.widgets).filter(x => !!x);
  const externalSchema = plugins.map(x => x.visual?.schema).filter(x => !!x);
  return {
    widgets: Object.assign({}, defaultVisualWidgets, ...externalWidgets),
    schema: Object.assign({}, defaultVisualSchema, ...externalSchema),
  };
};
