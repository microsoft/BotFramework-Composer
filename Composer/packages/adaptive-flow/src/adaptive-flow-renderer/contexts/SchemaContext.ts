// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension-client';

import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';

export interface SchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: WidgetSchemaProvider;
}

export const SchemaContext = React.createContext<SchemaContextValue>({
  widgets: {},
  schemaProvider: new WidgetSchemaProvider({ default: { widget: () => null } }),
});
