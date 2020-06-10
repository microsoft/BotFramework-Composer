// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, FlowEditorConfig, FlowEditorWidgetMap } from '@bfc/extension';

import { FlowSchema } from '../../adaptive-flow-renderer/types/flowRenderer.types';

export const mergePluginConfig = (...plugins: PluginConfig[]): Required<FlowEditorConfig> => {
  const externalWidgets = plugins.map((x) => x.visualSchema?.widgets).filter((x) => !!x) as FlowEditorWidgetMap[];
  const externalSchema = plugins.map((x) => x.visualSchema?.schema).filter((x) => !!x) as FlowSchema[];

  return {
    widgets: Object.assign({}, ...externalWidgets),
    schema: Object.assign({}, ...externalSchema),
  };
};
