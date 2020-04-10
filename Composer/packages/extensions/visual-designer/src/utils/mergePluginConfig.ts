// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, VisualEditorConfig } from '@bfc/extension';

import { defaultVisualSchema } from '../schema/defaultVisualSchema';
import { defaultVisualWidgets } from '../schema/defaultVisualWidgets';

export const mergePluginConfig = (...plugins: PluginConfig[]): Required<VisualEditorConfig> => {
  // const visualConfigs = plugins.map(x => x.visual).filter(x => !!x);
  return {
    widgets: defaultVisualWidgets,
    schema: defaultVisualSchema,
  };
};
