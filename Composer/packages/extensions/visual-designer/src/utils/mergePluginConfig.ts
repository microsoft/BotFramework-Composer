// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, FlowEditorConfig } from '@bfc/extension';

import { defaultFlowSchema } from '../schema/defaultFlowSchema';
import { defaultFlowWidgets } from '../schema/defaultFlowWidgets';

export const mergePluginConfig = (...plugins: PluginConfig[]): Required<FlowEditorConfig> => {
  const externalWidgets = plugins.map(x => x.visual?.widgets).filter(x => !!x);
  const externalSchema = plugins.map(x => x.visual?.schema).filter(x => !!x);
  return {
    widgets: Object.assign({}, defaultFlowWidgets, ...externalWidgets),
    schema: Object.assign({}, defaultFlowSchema, ...externalSchema),
  };
};
