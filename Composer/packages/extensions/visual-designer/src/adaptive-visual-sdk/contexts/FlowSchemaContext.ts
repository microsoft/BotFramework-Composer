// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension';

import { FlowSchemaProvider } from '../utils/visual/flowSchemaProvider';
import defaultFlowSchema from '../configs/builtinSchema';
import builtinActionWidgets from '../configs/builtinWidgets';

const defaultProvider = new FlowSchemaProvider(defaultFlowSchema);

export interface FlowSchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: FlowSchemaProvider;
}

export const FlowSchemaContext = React.createContext<FlowSchemaContextValue>({
  widgets: builtinActionWidgets,
  schemaProvider: defaultProvider,
});
