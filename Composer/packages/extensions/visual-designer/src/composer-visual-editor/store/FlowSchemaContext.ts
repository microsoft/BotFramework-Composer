// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension';

import { FlowSchemaProvider } from '../schema/flowSchemaProvider';
import { defaultFlowSchema } from '../schema/defaultFlowSchema';
import { defaultFlowWidgets } from '../schema/defaultFlowWidgets';

const defaultProvider = new FlowSchemaProvider(defaultFlowSchema);

export interface FlowSchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: FlowSchemaProvider;
}

export const FlowSchemaContext = React.createContext<FlowSchemaContextValue>({
  widgets: defaultFlowWidgets,
  schemaProvider: defaultProvider,
});
