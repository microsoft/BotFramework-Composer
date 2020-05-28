// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension';

import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';
import builtinSchema from '../configs/builtinSchema';
import builtinActionWidgets from '../configs/builtinWidgets';

const defaultProvider = new WidgetSchemaProvider(builtinSchema);

export interface SchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: WidgetSchemaProvider;
}

export const SchemaContext = React.createContext<SchemaContextValue>({
  widgets: builtinActionWidgets,
  schemaProvider: defaultProvider,
});
