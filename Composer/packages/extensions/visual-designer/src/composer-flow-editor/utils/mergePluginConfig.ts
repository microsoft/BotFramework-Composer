// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, FlowEditorConfig } from '@bfc/extension';

import { defaultFlowSchema } from '../../adaptive-visual-sdk/configs/defaultFlowSchema';
import { defaultFlowWidgets } from '../../adaptive-visual-sdk/configs/defaultFlowWidgets';

export const mergePluginConfig = (...plugins: PluginConfig[]): Required<FlowEditorConfig> => {
  const externalWidgets = plugins.map((x) => x.visualSchema?.widgets).filter((x) => !!x);
  const externalSchema = plugins.map((x) => x.visualSchema?.schema).filter((x) => !!x);
  return {
    widgets: Object.assign({}, defaultFlowWidgets, ...externalWidgets),
    schema: Object.assign({}, defaultFlowSchema, ...externalSchema),
  };
};
